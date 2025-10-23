const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();

// Enable CORS for all origins
app.use(cors());

app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

//patient routes
const viewDoctorRoutes = require('./routes/patient/viewDoctorRoutes');
app.use('/api', viewDoctorRoutes);

const viewPharmacyRoutes = require('./routes/patient/viewPharmacyRoutes');
app.use('/api', viewPharmacyRoutes);

const viewAppointmentRoutes = require('./routes/patient/viewAppointmentRoutes');
app.use('/api/appointments', viewAppointmentRoutes);


//pharmacy routes
const myDoctorRoutes = require('./routes/pharmacy/myDoctorRoutes');
app.use('/api', myDoctorRoutes);

const viewAllDoctorRoutes = require('./routes/pharmacy/viewAllDoctorRoutes');
app.use('/api', viewAllDoctorRoutes);


//doctor routes

//admin routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
