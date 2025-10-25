const express = require('express');
const router = express.Router();
const { getAllDoctorsForPharmacy, getDoctorOverallUnavailability, getPharmacyOverallUnavailability, getFormDropdownData } = require('../../controllers/pharmacy/viewAllDoctorController');
const { getRoleSpecificIdViaToken } = require('../../controllers/authController');

router.get('/pharmacy/all-doctors', getAllDoctorsForPharmacy);
router.get('/doctor/:doctorId/unavailability', getDoctorOverallUnavailability);
router.get('/pharmacy/unavailability', getRoleSpecificIdViaToken, getPharmacyOverallUnavailability);
router.get('/pharmacy/form-data', getRoleSpecificIdViaToken, getFormDropdownData);


module.exports = router;
