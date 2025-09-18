import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import Pharmacies from "./pages/Pharmacies";
import Login from "./pages/Login";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import { useState } from "react";
import MainLayout from "./layout/MainLayout";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <Router>
<Routes>
  <Route path="/login" element={<Login onLogin={handleLogin} />} />
  <Route element={isLoggedIn ? <MainLayout /> : <Login onLogin={handleLogin} />}>
    <Route path="/" element={<Home />} />
    <Route path="/doctors" element={<Doctors />} />
    <Route path="/pharmacies" element={<Pharmacies />} />
    <Route path="/patients" element={<Patients />} />
    <Route path="/appointments" element={<Appointments />} />
  </Route>
</Routes>
    </Router>
  );
}

export default App;
