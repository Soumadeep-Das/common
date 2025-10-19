// pharma_backend/routes/pharmacy/viewDoctorRoutes.js
const express = require('express');
const router = express.Router();
const { getMyDoctors, getMyDoctorDetails, getMyDoctorAppointments, getMyDoctorAppointmentDates } = require('../../controllers/pharmacy/myDoctorController');
const { getRoleSpecificIdViaToken } = require('../../controllers/authController');

router.get('/pharmacy/my-doctors', getRoleSpecificIdViaToken, getMyDoctors);
router.get('/pharmacy/doctors/:doctorId', getRoleSpecificIdViaToken, getMyDoctorDetails);
router.get('/pharmacy/doctors/:doctorId/appointments', getRoleSpecificIdViaToken, getMyDoctorAppointments);
router.get('/pharmacy/doctors/:doctorId/appointment-dates', getRoleSpecificIdViaToken, getMyDoctorAppointmentDates);


module.exports = router;
