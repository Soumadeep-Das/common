const pool = require('../db');

const getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user.role_specific_id;
    
    const result = await pool.query(`
      SELECT 
        a.*,
        d.doctor_name,
        p.pharmacy_name,
        ts.starting_time as appointment_time,
        dept.department_name
      FROM appointment a
      JOIN doctor_pharmacy_timing dpt ON a.doctor_pharmacy_timing_id = dpt.doctor_pharmacy_timing_id
      JOIN pharmacy_doctor_bridge pdb ON dpt.pharmacy_doctor_bridge_id = pdb.pharmacy_doctor_bridge_id
      JOIN doctor d ON pdb.doctor_id = d.doctor_id
      JOIN pharmacy p ON pdb.pharmacy_id = p.pharmacy_id
      JOIN time_slots ts ON dpt.time_slot_id = ts.time_slot_id
      JOIN doctor_department_bridge ddb ON d.doctor_id = ddb.doctor_id
      JOIN department dept ON ddb.department_id = dept.department_id
      WHERE a.patient_id = $1
      ORDER BY a.appointment_date DESC, ts.starting_time DESC
    `, [patientId]);
    
    const appointments = result.rows;
    const now = new Date();
    
    const categorized = {
      upcoming: [],
      completed: [],
      cancelled: []
    };
    
    appointments.forEach(apt => {
            const aptDate = new Date(apt.appointment_date);
      const [hours, minutes] = apt.appointment_time.split(':');
      aptDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      console.log(apt.patient_status, aptDate, now);
      if (apt.patient_status  === 'cancelled') {
        categorized.cancelled.push(apt);
      } else if (apt.patient_status  === 'completed' || (apt.patient_status === 'booked' && aptDate < now)) {
        categorized.completed.push(apt);
      } else {
        categorized.upcoming.push(apt);
      }
    });
    
    res.json(categorized);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const patientId = req.user.role_specific_id;
    
    const result = await pool.query(
      'UPDATE appointment SET patient_status = $1 WHERE appointment_id = $2 AND patient_id = $3 RETURNING *',
      ['cancelled', appointmentId, patientId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json({ success: true, appointment: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getPatientAppointments, cancelAppointment  };
