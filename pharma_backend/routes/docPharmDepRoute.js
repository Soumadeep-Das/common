const express = require('express');
const router = express.Router();
const { getDoctorPharmacyMapping } = require('../controllers/docPharmDepController');

router.get('/doc-pharma-dept', getDoctorPharmacyMapping);

module.exports = router;
