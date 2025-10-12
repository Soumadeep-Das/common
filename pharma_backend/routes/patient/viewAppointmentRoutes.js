const express = require('express');
const router = express.Router();
const { bookAppointment, getPatientAppointments, cancelAppointment } = require('../../controllers/patient/viewAppointmentController');
const { getRoleSpecificIdViaToken } = require('../../controllers/authController');

router.post('/book-appointment', getRoleSpecificIdViaToken , bookAppointment);
router.get('/patient-appointments', getRoleSpecificIdViaToken, getPatientAppointments);
router.put('/:appointmentId/cancel', getRoleSpecificIdViaToken, cancelAppointment);
// router.get('/', (req, res) => res.json([]));

module.exports = router;

