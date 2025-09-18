const express = require('express');
const router = express.Router();

// Placeholder: return empty array for patients
router.get('/', (req, res) => {
  res.json([]);
});

module.exports = router;
