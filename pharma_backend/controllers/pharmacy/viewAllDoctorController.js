const pool = require('../../db');

const getAllDoctorsForPharmacy = async (req, res) => {
  try {
    const query = `
      SELECT 
        d.doctor_id,
        d.doctor_name,
        dept.department_name
      FROM doctor d
      JOIN doctor_department_bridge ddb ON d.doctor_id = ddb.doctor_id
      JOIN department dept ON ddb.department_id = dept.department_id
      ORDER BY d.doctor_name
    `;
    
    const result = await pool.query(query);
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const getDoctorOverallUnavailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const query = `
      SELECT 
        day.day_name,
        ts.starting_time,
        ts.ending_time,
        oc.occurrence_name,
        wk.week_number
      FROM doctor_pharmacy_timing dpt
      JOIN pharmacy_doctor_bridge pdb ON dpt.pharmacy_doctor_bridge_id = pdb.pharmacy_doctor_bridge_id
      JOIN day ON dpt.day_id = day.day_id
      JOIN time_slots ts ON dpt.time_slot_id = ts.time_slot_id
      JOIN occurrence oc ON dpt.occurrence_id = oc.occurrence_id
      LEFT JOIN week wk ON dpt.week_id = wk.week_id
      WHERE pdb.doctor_id = $1
      ORDER BY day.day_id, ts.starting_time
    `;
    
    const result = await pool.query(query, [doctorId]);
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPharmacyOverallUnavailability = async (req, res) => {
  try {
    const pharmacyId = req.user.role_specific_id;
    
    const query = `
      SELECT 
        day.day_name,
        ts.starting_time,
        ts.ending_time,
        oc.occurrence_name,
        wk.week_number,
        dpt.room_number
      FROM doctor_pharmacy_timing dpt
      JOIN pharmacy_doctor_bridge pdb ON dpt.pharmacy_doctor_bridge_id = pdb.pharmacy_doctor_bridge_id
      JOIN day ON dpt.day_id = day.day_id
      JOIN time_slots ts ON dpt.time_slot_id = ts.time_slot_id
      JOIN occurrence oc ON dpt.occurrence_id = oc.occurrence_id
      LEFT JOIN week wk ON dpt.week_id = wk.week_id
      WHERE pdb.pharmacy_id = $1
      ORDER BY day.day_id, ts.starting_time
    `;
    
    const result = await pool.query(query, [pharmacyId]);
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const getFormDropdownData = async (req, res) => {
  try {
    const pharmacyId = req.user.role_specific_id;
    
    // Get all dropdown data in parallel
    const [occurrenceResult, weekResult, dayResult, timeSlotsResult, pharmacyResult] = await Promise.all([
      pool.query('SELECT * FROM occurrence ORDER BY occurrence_id'),
      pool.query('SELECT * FROM week ORDER BY week_id'),
      pool.query('SELECT * FROM day ORDER BY day_id'),
      pool.query('SELECT * FROM time_slots ORDER BY time_slot_id'),
      pool.query('SELECT room_count FROM pharmacy WHERE pharmacy_id = $1', [pharmacyId])
    ]);

    const roomCount = pharmacyResult.rows[0]?.room_count || 1;
    const rooms = Array.from({length: roomCount}, (_, i) => i + 1);

    res.json({
      data: {
        occurrences: occurrenceResult.rows,
        weeks: weekResult.rows,
        days: dayResult.rows,
        timeSlots: timeSlotsResult.rows,
        rooms: rooms
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = {getAllDoctorsForPharmacy,  getDoctorOverallUnavailability,  getPharmacyOverallUnavailability,  getFormDropdownData};
