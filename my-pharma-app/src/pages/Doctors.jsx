import React, { useEffect, useState } from "react";
import { getDoctors } from "../api";
import DoctorCard from "../components/DoctorCard";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    getDoctors().then((res) => setDoctors(res.data));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4 font-semibold">Doctors</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {doctors.map((doc) => (
          <DoctorCard key={doc.doctor_id} doctor={doc} />
        ))}
      </div>
    </div>
  );
}
