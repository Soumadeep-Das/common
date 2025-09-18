const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();

// Enable CORS for all origins
app.use(cors());

app.use(express.json());

const doctorRoutes = require('./routes/doctorRoutes');
app.use('/api', doctorRoutes);

const mappingRoutes = require('./routes/docPharmDepRoute');
app.use('/api', mappingRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const patientRoutes = require('./routes/patientRoutes');
app.use('/api/patients', patientRoutes);

const appointmentRoutes = require('./routes/appointmentRoutes');
app.use('/api/appointments', appointmentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
