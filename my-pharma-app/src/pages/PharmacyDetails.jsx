import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoctorsByPharmacy } from "../api";
import DoctorCard from "../components/DoctorCard";

export default function PharmacyDetails() {
  const { pharmacyId } = useParams();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [pharmacyName, setPharmacyName] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  useEffect(() => {
    getDoctorsByPharmacy(pharmacyId).then((res) => {
      setDoctors(res.data);
      if (res.data.length > 0) {
        setPharmacyName(res.data[0].pharmacy_name);
      }
    });
  }, [pharmacyId]);

  const departments = [...new Set(doctors.map(doctor => doctor.department_name))];
  const filteredDoctors = selectedDepartment 
    ? doctors.filter(doctor => doctor.department_name === selectedDepartment)
    : doctors;

  return (
    <div className="p-6">
      <button 
        onClick={() => navigate('/pharmacies')}
        className="mb-4 text-blue-500 hover:underline"
      >
        ← Back to Pharmacies
      </button>
      
      <h2 className="text-2xl mb-4 font-semibold">
        Doctors at {pharmacyName}
      </h2>

      <div className="mb-4">
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredDoctors.map((doctor) => (
          <DoctorCard 
            key={doctor.doctor_id} 
            doctor={doctor} 
            fromPharmacy={pharmacyId}
          />
        ))}
      </div>
    </div>
  );
}
