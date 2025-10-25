const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.register); // Optional
router.get('/me', authController.getMe);
router.get('/me-specific', authController.getMeSpecificRole);

module.exports = router;
