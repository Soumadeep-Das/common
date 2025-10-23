import { useState, useEffect } from 'react';
import AllDoctorCard from '../../components/pharmacy/PharmacyAllDoctorCard';

export default function ViewAllDoctorForPharmacy() {
  const [doctors, setDoctors] = useState([]);
  const [connectedDoctors, setConnectedDoctors] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllDoctors();
    fetchConnectedDoctors();
  }, []);

const fetchAllDoctors = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/pharmacy/all-doctors');
    const data = await response.json();
    setDoctors(data.data || []);
  } catch (error) {
    console.error('Error fetching doctors:', error);
  }
};

  const fetchConnectedDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/pharmacy/my-doctors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      const connectedIds = new Set(data.data.map(doctor => doctor.doctor_id));
      setConnectedDoctors(connectedIds);
    } catch (error) {
      console.error('Error fetching connected doctors:', error);
    } finally {
      setLoading(false);
    }
  };


 if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Doctors</h1>
      
      {doctors.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No doctors found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {doctors.map((doctor) => (
            <AllDoctorCard 
              key={doctor.doctor_id} 
              doctor={doctor} 
              isConnected={connectedDoctors.has(doctor.doctor_id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}