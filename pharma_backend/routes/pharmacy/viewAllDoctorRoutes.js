const express = require('express');
const router = express.Router();
const { getAllDoctorsForPharmacy } = require('../../controllers/pharmacy/viewAllDoctorController');
const { getRoleSpecificIdViaToken } = require('../../controllers/authController');

router.get('/pharmacy/all-doctors', getAllDoctorsForPharmacy);


module.exports = router;
