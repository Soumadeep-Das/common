// pharma_backend/routes/pharmacy/viewDoctorRoutes.js
const express = require('express');
const router = express.Router();
const { getMyDoctors, getMyDoctorDetails } = require('../../controllers/pharmacy/myDoctorController');
const { getRoleSpecificIdViaToken } = require('../../controllers/authController');

router.get('/pharmacy/my-doctors', getRoleSpecificIdViaToken, getMyDoctors);
router.get('/pharmacy/doctors/:doctorId', getRoleSpecificIdViaToken, getMyDoctorDetails);

module.exports = router;
