const express = require('express');
const router = express.Router();
const { getDoctors,getPharmacies,getDepartments,getDoctorDetails } = require('../controllers/doctorController');

router.post('/doctors-dept', getDoctors);
router.get('/departments', getDepartments);
router.get('/doctors/:doctorId', getDoctorDetails);

router.get('/pharmacies', getPharmacies); 



module.exports = router;
