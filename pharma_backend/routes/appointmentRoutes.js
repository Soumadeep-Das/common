const express = require('express');
const router = express.Router();
const { getPatientAppointments } = require('../controllers/appointmentController');
const { getRoleSpecificIdViaToken } = require('../controllers/doctorController');

router.get('/patient', getRoleSpecificIdViaToken, getPatientAppointments);
// router.get('/', (req, res) => res.json([]));

module.exports = router;

