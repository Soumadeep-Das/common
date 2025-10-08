const pool = require('../db');

const getDoctorsByPharmacy = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const result = await pool.query(`
      SELECT 
        d.doctor_id,
        d.doctor_name,
        dept.department_name,
        p.pharmacy_name
      FROM 
        pharmacy_doctor_bridge pdb
      JOIN doctor d ON pdb.doctor_id = d.doctor_id
      JOIN doctor_department_bridge ddb ON d.doctor_id = ddb.doctor_id
      JOIN department dept ON ddb.department_id = dept.department_id
      JOIN pharmacy p ON pdb.pharmacy_id = p.pharmacy_id
      WHERE pdb.pharmacy_id = $1;
    `, [pharmacyId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching doctors by pharmacy:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = { getDoctorsByPharmacy };
