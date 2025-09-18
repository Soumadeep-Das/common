import React, { useEffect, useState } from "react";
import { getPharmacies } from "../api";
import PharmacyCard from "../components/Pharmacycard";

export default function Pharmacies() {
  const [pharmacies, setPharmacies] = useState([]);

  useEffect(() => {
    getPharmacies().then((res) => setPharmacies(res.data));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4 font-semibold">Pharmacies</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {pharmacies.map((pharma) => (
          <PharmacyCard key={pharma.pharmacy_id} pharmacy={pharma} />
        ))}
      </div>
    </div>
  );
}
