const pool = require('../db');

const getDoctorPharmacyMapping = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.doctor_id,
        p.pharmacy_name,
        d.doctor_name,
        dept.department_name
      FROM 
        pharmacy_doctor_bridge pdb
      JOIN pharmacy p ON pdb.pharmacy_id = p.pharmacy_id
      JOIN doctor d ON pdb.doctor_id = d.doctor_id
      JOIN doctor_department_bridge ddb ON d.doctor_id = ddb.doctor_id
      JOIN department dept ON ddb.department_id = dept.department_id;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching doctor-pharmacy-department mapping:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getDoctorPharmacyMapping };
