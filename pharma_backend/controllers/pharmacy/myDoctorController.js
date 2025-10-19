const pool = require('../../db');

const getMyDoctors = async (req, res) => {
  try {
    const pharmacyId = req.user.role_specific_id;
    
    const query = `
      SELECT 
        d.doctor_id,
        d.doctor_name,
        dept.department_name,
        oc.occurrence_name,
        wk.week_number,
        day.day_name,
        ts.starting_time,
        ts.ending_time
      FROM doctor d
      JOIN pharmacy_doctor_bridge pdb ON d.doctor_id = pdb.doctor_id
      JOIN doctor_department_bridge ddb ON d.doctor_id = ddb.doctor_id
      JOIN department dept ON ddb.department_id = dept.department_id
      LEFT JOIN doctor_pharmacy_timing dptt ON pdb.pharmacy_doctor_bridge_id = dptt.pharmacy_doctor_bridge_id
      LEFT JOIN day ON dptt.day_id = day.day_id
      LEFT JOIN time_slots ts ON dptt.time_slot_id = ts.time_slot_id
      LEFT JOIN occurrence oc ON dptt.occurrence_id = oc.occurrence_id
      LEFT JOIN week wk ON dptt.week_id = wk.week_id
      WHERE pdb.pharmacy_id = $1
      ORDER BY d.doctor_name
    `;
    
    const result = await pool.query(query, [pharmacyId]);
    
    const doctorMap = {};
    result.rows.forEach(row => {
      if (!doctorMap[row.doctor_id]) {
        doctorMap[row.doctor_id] = {
          doctor_id: row.doctor_id,
          doctor_name: row.doctor_name,
          department_name: row.department_name,
          timings: []
        };
      }
      
      if (row.day_name) {
        doctorMap[row.doctor_id].timings.push(row);
      }
    });
    
    const doctors = Object.values(doctorMap).map(doctor => ({
      doctor_id: doctor.doctor_id,
      doctor_name: doctor.doctor_name,
      department_name: doctor.department_name,
      sitting_details: formatSittingDetails(doctor.timings, false)
    }));
    
    res.json({ data: doctors });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

function formatSittingDetails(timings, includePatientCount = false) {
  if (!timings.length) return 'No sitting schedule';
  
  const grouped = {};
  
  timings.forEach(timing => {
    const key = includePatientCount 
      ? `${timing.occurrence_name}_${timing.starting_time}_${timing.ending_time}_${timing.patient_count}`
      : `${timing.occurrence_name}_${timing.starting_time}_${timing.ending_time}`;
    if (!grouped[key]) {
      grouped[key] = {
        occurrence: timing.occurrence_name,
        start_time: timing.starting_time,
        end_time: timing.ending_time,
        patient_count: timing.patient_count,
        days: [],
        weeks: []
      };
    }
    grouped[key].days.push(timing.day_name);
    if (timing.week_number) {
      grouped[key].weeks.push(timing.week_number);
    }
  });
  
  return Object.values(grouped).map(group => {
    const timeStr = `${group.start_time.slice(0, 5)} to ${group.end_time.slice(0, 5)}`;
    const uniqueDays = [...new Set(group.days)];
    const patientInfo = includePatientCount ? ` ,checks ${group.patient_count} patients` : '';
    
    if (group.occurrence === 'daily') {
      return `daily from ${timeStr}${patientInfo}`;
    } else if (group.occurrence === 'weekly') {
      return `every ${uniqueDays.join(' and ')} from ${timeStr}${patientInfo}`;
    } else if (group.occurrence === 'monthly') {
      const weeks = [...new Set(group.weeks)].sort();
      const weekStr = weeks.map(w => {
        const ordinals = ['', '1st', '2nd', '3rd', '4th'];
        return ordinals[w] || `${w}th`;
      }).join(' and ');
      return `${weekStr} ${uniqueDays[0]} from ${timeStr}${patientInfo}`;
    }
    return `${uniqueDays.join(', ')} from ${timeStr}${patientInfo}`;
  }).join('\n');
}


const getMyDoctorDetails = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const pharmacyId = req.user.role_specific_id;
    
    const query = `
      SELECT 
        d.doctor_id,
        d.doctor_name,
        --d.contact,
        --d.degree,
        --d.specialization,
        dept.department_name,
        --ddb.fees,
        dptt.patient_count,
        oc.occurrence_name,
        wk.week_number,
        day.day_name,
        ts.starting_time,
        ts.ending_time
      FROM doctor d
      JOIN pharmacy_doctor_bridge pdb ON d.doctor_id = pdb.doctor_id
      JOIN doctor_department_bridge ddb ON d.doctor_id = ddb.doctor_id
      JOIN department dept ON ddb.department_id = dept.department_id
      LEFT JOIN doctor_pharmacy_timing dptt ON pdb.pharmacy_doctor_bridge_id = dptt.pharmacy_doctor_bridge_id
      LEFT JOIN day ON dptt.day_id = day.day_id
      LEFT JOIN time_slots ts ON dptt.time_slot_id = ts.time_slot_id
      LEFT JOIN occurrence oc ON dptt.occurrence_id = oc.occurrence_id
      LEFT JOIN week wk ON dptt.week_id = wk.week_id
      WHERE pdb.pharmacy_id = $1 AND d.doctor_id = $2
    `;
    
    const result = await pool.query(query, [pharmacyId, doctorId]);
    
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    const doctor = {
      doctor_id: result.rows[0].doctor_id,
      doctor_name: result.rows[0].doctor_name,
      // contact: result.rows[0].contact,
      // degree: result.rows[0].degree,
      // specialization: result.rows[0].specialization,
      department_name: result.rows[0].department_name,
      // fees: result.rows[0].fees,
      patient_count: result.rows[0].patient_count,
      sitting_details: formatSittingDetails(result.rows.filter(row => row.day_name), true)
    };
    
    res.json({ data: doctor });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMyDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const pharmacyId = req.user.role_specific_id;
    const { date } = req.query;
    
    let query, params;
    
    if (date) {
      // Filter by specific date
      query = `
        SELECT 
          a.*,
          p.patient_name,
          ts.starting_time as appointment_time,
          DATE(a.appointment_date) as appointment_date_only
        FROM appointment a
        JOIN doctor_pharmacy_timing dpt ON a.doctor_pharmacy_timing_id = dpt.doctor_pharmacy_timing_id
        JOIN pharmacy_doctor_bridge pdb ON dpt.pharmacy_doctor_bridge_id = pdb.pharmacy_doctor_bridge_id
        JOIN patient p ON a.patient_id = p.patient_id
        JOIN time_slots ts ON dpt.time_slot_id = ts.time_slot_id
        WHERE pdb.doctor_id = $1 AND pdb.pharmacy_id = $2
          AND DATE(a.appointment_date) = $3
        ORDER BY a.appointment_date ASC, ts.starting_time ASC
      `;
      params = [doctorId, pharmacyId, date];
    } else {
      // Get all appointments for date picker
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      query = `
        SELECT 
          a.*,
          p.patient_name,
          ts.starting_time as appointment_time,
          DATE(a.appointment_date) as appointment_date_only
        FROM appointment a
        JOIN doctor_pharmacy_timing dpt ON a.doctor_pharmacy_timing_id = dpt.doctor_pharmacy_timing_id
        JOIN pharmacy_doctor_bridge pdb ON dpt.pharmacy_doctor_bridge_id = pdb.pharmacy_doctor_bridge_id
        JOIN patient p ON a.patient_id = p.patient_id
        JOIN time_slots ts ON dpt.time_slot_id = ts.time_slot_id
        WHERE pdb.doctor_id = $1 AND pdb.pharmacy_id = $2
          AND a.appointment_date BETWEEN $3 AND $4
        ORDER BY a.appointment_date ASC, ts.starting_time ASC
      `;
      params = [doctorId, pharmacyId, startDate, endDate];
    }
    
    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMyDoctorAppointmentDates = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const pharmacyId = req.user.role_specific_id;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    
    const query = `
      SELECT DISTINCT a.appointment_date
      FROM appointment a
      JOIN doctor_pharmacy_timing dpt ON a.doctor_pharmacy_timing_id = dpt.doctor_pharmacy_timing_id
      JOIN pharmacy_doctor_bridge pdb ON dpt.pharmacy_doctor_bridge_id = pdb.pharmacy_doctor_bridge_id
      WHERE pdb.doctor_id = $1 AND pdb.pharmacy_id = $2
        AND a.appointment_date BETWEEN $3 AND $4
      ORDER BY a.appointment_date ASC
    `;
    
    const result = await pool.query(query, [doctorId, pharmacyId, startDate, endDate]);
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};



module.exports = { getMyDoctors, getMyDoctorDetails, getMyDoctorAppointments, getMyDoctorAppointmentDates };

