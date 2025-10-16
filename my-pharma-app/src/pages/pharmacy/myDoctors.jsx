// my-pharma-app/src/pages/pharmacy/myDoctors.jsx
import { useState, useEffect } from 'react';
import PharmacyDoctorCard from '../../components/pharmacy/PharmacyDoctorCard';

export default function MyDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyDoctors();
  }, []);

  const fetchMyDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/pharmacy/my-doctors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setDoctors(data.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Doctors</h1>
      
      {doctors.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No doctors found for your pharmacy.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {doctors.map((doctor) => (
            <PharmacyDoctorCard key={doctor.doctor_id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
}
