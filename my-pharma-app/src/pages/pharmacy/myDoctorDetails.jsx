// Updated myDoctorDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function MyDoctorDetails() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorDetails();
  }, [doctorId]);

  const fetchDoctorDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/pharmacy/doctors/${doctorId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setDoctor(data.data);
    } catch (error) {
      console.error('Error fetching doctor details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckBookings = () => {
    navigate(`/pharmacy/doctors/${doctorId}/bookings`);
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (!doctor) return <div className="text-center text-red-500">Doctor not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="mb-4 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        ← Back
      </button>
      <h1 className="text-2xl font-bold mb-8">Doctor Details</h1>
      
      <div className="bg-white rounded-xl shadow p-6 mb-3">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold">{doctor.doctor_name}</h2>
            <p className="text-blue-600">{doctor.department_name}</p>
            <p className="text-gray-600">{doctor.contact || "999999999"}</p>
            <p className="text-gray-600">{doctor.degree || "MBBS"}</p>
            <p className="text-gray-600">{doctor.specialization || "MD"}</p>
          </div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            View More
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">Schedule & Fees</h3>
          <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Modify
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Consultation Fee</p>
            <p className="text-lg font-semibold">₹{doctor.fees || 500}</p>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-2">Sitting Details</p>
          <div className="text-gray-700 whitespace-pre-line">{doctor.sitting_details}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Bookings</h3>
        <div className="grid grid-cols-2 gap-4">
          <button 
            className="px-4 py-3 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
            disabled
          >
            Add Booking
          </button>
          <button 
            onClick={handleCheckBookings}
            className="px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Check Bookings
          </button>
        </div>
      </div>
    </div>
  );
}
