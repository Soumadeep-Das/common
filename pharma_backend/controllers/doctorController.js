const pool = require('../db');

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



const getPharmacies = async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM pharmacy');
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching pharmacies:', err);
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
  
  module.exports = { getDoctors, getPharmacies, getDepartments };
