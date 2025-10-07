const express = require('express');
const router = express.Router();
const { getPatientAppointments, cancelAppointment } = require('../controllers/appointmentController');
const { getRoleSpecificIdViaToken } = require('../controllers/doctorController');

router.get('/patient', getRoleSpecificIdViaToken, getPatientAppointments);
router.put('/:appointmentId/cancel', getRoleSpecificIdViaToken, cancelAppointment);
// router.get('/', (req, res) => res.json([]));

module.exports = router;

