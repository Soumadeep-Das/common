const pool = require('../db');

const getDoctors = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM doctor');
    res.json(result.rows);
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
  
  module.exports = { getDoctors, getPharmacies };
