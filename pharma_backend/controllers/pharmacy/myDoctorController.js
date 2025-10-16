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
      sitting_details: formatSittingDetails(doctor.timings)
    }));
    
    res.json({ data: doctors });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

function formatSittingDetails(timings) {
  if (!timings.length) return 'No sitting schedule';
  
  const grouped = {};
  
  timings.forEach(timing => {
    const key = `${timing.occurrence_name}_${timing.starting_time}_${timing.ending_time}`;
    if (!grouped[key]) {
      grouped[key] = {
        occurrence: timing.occurrence_name,
        start_time: timing.starting_time,
        end_time: timing.ending_time,
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
    
    if (group.occurrence === 'daily') {
      return `Daily from ${timeStr}`;
    } else if (group.occurrence === 'weekly') {
      if (uniqueDays.length === 1) {
        return `Every ${uniqueDays[0]} from ${timeStr}`;
      } else {
        return uniqueDays.map(day => `${day} from ${timeStr}`).join(' and ');
      }
    } else if (group.occurrence === 'monthly') {
      const weeks = [...new Set(group.weeks)].sort();
      const weekStr = weeks.map(w => {
        const ordinals = ['', '1st', '2nd', '3rd', '4th'];
        return ordinals[w] || `${w}th`;
      }).join(' and ');
      return `${weekStr} ${uniqueDays[0]} from ${timeStr}`;
    }
    return `${uniqueDays.join(', ')} from ${timeStr}`;
  }).join('; ');
}



module.exports = { getMyDoctors };
