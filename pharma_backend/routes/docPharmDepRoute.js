const express = require('express');
const router = express.Router();
const { getDoctorsByPharmacy } = require('../controllers/docPharmDepController');

router.get('/pharmacy/:pharmacyId/doctors', getDoctorsByPharmacy);

module.exports = router;
