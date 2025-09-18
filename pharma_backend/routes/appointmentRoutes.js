const express = require('express');
const router = express.Router();

// Placeholder: return empty array for appointments
router.get('/', (req, res) => {
  res.json([]);
});

module.exports = router;
