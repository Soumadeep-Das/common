const express = require('express');
const router = express.Router();
const { getDoctors,getDepartments,getSlotDetails } = require('../../controllers/patient/viewDoctorController');

router.post('/doctors-dept', getDoctors);
router.get('/departments', getDepartments);
router.get('/slots/:doctorId', getSlotDetails);


module.exports = router;
