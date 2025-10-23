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


module.exports = {getAllDoctorsForPharmacy};
