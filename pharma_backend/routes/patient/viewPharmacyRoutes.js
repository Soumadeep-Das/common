const express = require('express');
const router = express.Router();
const { getDoctorsByPharmacy, getPharmacies } = require('../../controllers/patient/viewPharmacyController');

router.get('/pharmacies', getPharmacies); 
router.get('/pharmacy/:pharmacyId/doctors', getDoctorsByPharmacy);

module.exports = router;
