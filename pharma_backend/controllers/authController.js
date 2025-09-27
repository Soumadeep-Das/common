const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Login endpoint
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE user_name = $1', [username]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Compare password (plain for now, use bcrypt if hashed)
    // If passwords are hashed, use: await bcrypt.compare(password, user.password)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign({ user_id: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { username: user.username, role: user.role, name: user.name } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Registration endpoint (optional, for new users)
exports.register = async (req, res) => {
  const { username, password, role, name, email, phone } = req.body;
  try {
    // Hash password if needed: const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, name, password, role, status, email, phone) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [username, name, password, role, 'approved', email, phone]
    );
    const user = result.rows[0];
    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get current user info
exports.getMe = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [decoded.user_id]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ username: user.user_name, role: user.role, name: user.full_name, email: user.email, phone: user.phone_no });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token', error: err.message });
  }
};


exports.getMeSpecificRole = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let user, result;

    if (decoded.role === 'doctor') {
      result = await pool.query('SELECT * FROM doctors WHERE user_id = $1', [decoded.user_id]);
      user = result.rows[0];
      if (!user) return res.status(404).json({ message: 'Doctor not found' });
      res.json({
        username: user.user_name,
        name: user.full_name,
        email: user.email,
        role: decoded.role,
        specialization: user.specialization
      });
    } else if (decoded.role === 'pharmacy') {
      result = await pool.query('SELECT * FROM pharmacies WHERE user_id = $1', [decoded.user_id]);
      user = result.rows[0];
      if (!user) return res.status(404).json({ message: 'Pharmacy not found' });
      res.json({
        username: user.user_name,
        name: user.pharmacy_name,
        email: user.email,
        role: decoded.role,
        address: user.address
      });
    } else {
      // Default: patient or other roles in users table
      result = await pool.query('SELECT * FROM users WHERE user_id = $1', [decoded.user_id]);
      user = result.rows[0];
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({
        username: user.user_name,
        name: user.full_name,
        email: user.email,
        role: decoded.role,
        phone: user.phone_no
      });
    }
  } catch (err) {
    res.status(401).json({ message: 'Invalid token', error: err.message });
  }
};