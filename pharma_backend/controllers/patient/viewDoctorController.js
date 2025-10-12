const pool = require('../../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const getDoctors = async (req, res) => {
  try {
    const { filters = {}, page = 1, limit = 10 } = req.body;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        d.doctor_id,
        d.doctor_name,
        dept.department_name
      FROM 
      doctor d 
      JOIN doctor_department_bridge ddb ON d.doctor_id = ddb.doctor_id
      JOIN department dept ON ddb.department_id = dept.department_id
    `;
    
    const params = [];
    if (filters.department) {
      query += ` WHERE dept.department_name = $1`;
      params.push(filters.department);
    }
    
    const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) FROM');

    const totalResult = await pool.query(countQuery, params);
    const total = parseInt(totalResult.rows[0].count);
    
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        hasMore: page * limit < total
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};



  const getDepartments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT department_name FROM department
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
  
const getSlotDetails = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const doctorQuery = `
      SELECT 
        d.doctor_id,
        d.doctor_name,
        dept.department_name
      FROM 
      doctor d 
      JOIN doctor_department_bridge ddb ON d.doctor_id = ddb.doctor_id
      JOIN department dept ON ddb.department_id = dept.department_id
      WHERE d.doctor_id = $1
    `;
    
    const doctorResult = await pool.query(doctorQuery, [doctorId]);
    
    if (doctorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    const timingsQuery = `
      SELECT 
        d.doctor_id,
        d.doctor_name,
        p.pharmacy_id,
        p.pharmacy_name,
        dpt.day_name AS day,
        ts.starting_time,
        ts.ending_time,
        o.occurrence_name AS occurrence,
        w.week_number,
        dptt.patient_count,
        dptt.doctor_pharmacy_timing_id
      FROM public.doctor d
      JOIN public.pharmacy_doctor_bridge pdb
          ON d.doctor_id = pdb.doctor_id
      JOIN public.pharmacy p
          ON pdb.pharmacy_id = p.pharmacy_id
      JOIN public.doctor_pharmacy_timing dptt
          ON pdb.pharmacy_doctor_bridge_id = dptt.pharmacy_doctor_bridge_id
      LEFT JOIN public.day dpt
          ON dptt.day_id = dpt.day_id
      LEFT JOIN public.time_slots ts
          ON dptt.time_slot_id = ts.time_slot_id
      LEFT JOIN public.occurrence o
          ON dptt.occurrence_id = o.occurrence_id
      LEFT JOIN public.week w
          ON dptt.week_id = w.week_id
      WHERE 
      d.doctor_id = $1 
      ORDER BY p.pharmacy_id, ts.starting_time
    `;
    
    const timingsResult = await pool.query(timingsQuery, [doctorId]);
    
    const pharmacyMap = {};
    timingsResult.rows.forEach(row => {
      if (!pharmacyMap[row.pharmacy_id]) {
        pharmacyMap[row.pharmacy_id] = {
          pharmacy_id: row.pharmacy_id,
          pharmacy_name: row.pharmacy_name,
          timings: []
        };
      }
      pharmacyMap[row.pharmacy_id].timings.push(row);
    });
    
    const pharmaciesWithSlots = await Promise.all(
      Object.values(pharmacyMap).map(async pharmacy => {
        const slots = await generateNextSlotsWithAvailability(pharmacy.timings);
        return {
          //...pharmacy, // for timingDetails if needed
          pharmacy_id: pharmacy.pharmacy_id,
          pharmacy_name: pharmacy.pharmacy_name,
          slots: slots.slice(0, 3)
        };
      })
    );
    
    res.json({
      doctor: doctorResult.rows[0],
      pharmacies: pharmaciesWithSlots
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function generateNextSlotsWithAvailability(timings) {
  const slots = [];
  const today = new Date();
  const now = new Date();
  
  for (const timing of timings) {
    for (let i = 0; i < 90; i++) {
      const checkDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[checkDate.getDay()];
      
      if (timing.day === dayName) {
        if (timing.occurrence === 'weekly' || 
           (timing.occurrence === 'monthly' && Math.ceil(checkDate.getDate() / 7) === timing.week_number)) {
          
          const dateStr = checkDate.getFullYear() + '-' + 
                         String(checkDate.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(checkDate.getDate()).padStart(2, '0');

          // Check if slot is at least 3 hours from now
          const slotDateTime = new Date(dateStr + ' ' + timing.starting_time);
          const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
          
          if (slotDateTime < threeHoursFromNow) {
            continue; // Skip this slot
          }
          
          const availabilityQuery = `
            SELECT 
              dptt.patient_count,
              COUNT(a.appointment_id) AS booked_count,
              (dptt.patient_count - COUNT(a.appointment_id)) AS available_count
            FROM public.doctor_pharmacy_timing dptt
            LEFT JOIN public.appointment a
              ON a.doctor_pharmacy_timing_id = dptt.doctor_pharmacy_timing_id
             AND a.appointment_date = $1
            WHERE dptt.doctor_pharmacy_timing_id = $2
            GROUP BY dptt.patient_count
          `;
          
          const availabilityResult = await pool.query(availabilityQuery, [dateStr, timing.doctor_pharmacy_timing_id]);
          const available = availabilityResult.rows[0]?.available_count > 0;
          
          slots.push({
            id: `${timing.pharmacy_id}_${dateStr}_${timing.starting_time}`,
            date: dateStr,
            time: timing.starting_time.slice(0, 5),
            available,
            available_count: availabilityResult.rows[0]?.available_count || timing.patient_count,
            doctor_pharmacy_timing_id: timing.doctor_pharmacy_timing_id
          });
        }
      }
    }
  }
  
return slots.sort((a, b) => {
  const dateA = new Date(a.date + ' ' + a.time);
  const dateB = new Date(b.date + ' ' + b.time);
  return dateA - dateB;
})};







  module.exports = { getDoctors, getDepartments, getSlotDetails };
