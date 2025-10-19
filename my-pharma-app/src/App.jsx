import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Doctors from "./pages/patient/Doctors";
import SlotDetails from "./pages/patient/SlotDetails";
import Pharmacies from "./pages/patient/Pharmacies";
import PharmacyDetails from "./pages/patient/PharmacyDetails";
import Login from "./pages/Login";
import Appointments from "./pages/patient/Appointments";
import { useState, useEffect } from "react";
import MainLayout from "./layout/MainLayout";
import Profile from "./pages/patient/Profile";
import MyDoctors from "./pages/pharmacy/myDoctors";
import MyDoctorDetails from "./pages/pharmacy/myDoctorDetails";
import MyDoctorBookings from "./pages/pharmacy/MyDoctorBookings";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route element={isLoggedIn ? <MainLayout /> : <Login onLogin={handleLogin} />}>
          <Route path="/" element={<Home />} />
          //patient
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/slots/:doctorId" element={<SlotDetails />} />
          <Route path="/pharmacies" element={<Pharmacies />} />
          <Route path="/pharmacies/:pharmacyId" element={<PharmacyDetails />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/profile" element={<Profile />} />
          //pharmacy
          <Route path="/my-doctors" element={<MyDoctors />} />
          <Route path="/pharmacy/my-doctors/:doctorId" element={<MyDoctorDetails />} />
          <Route path="/pharmacy/doctors/:doctorId/bookings" element={<MyDoctorBookings />} />
          //doctor
          //admin
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
