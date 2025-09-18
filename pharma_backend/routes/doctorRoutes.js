const express = require('express');
const router = express.Router();
const { getDoctors,getPharmacies } = require('../controllers/doctorController');

router.get('/doctors', getDoctors);

router.get('/pharmacies', getPharmacies); 



module.exports = router;
