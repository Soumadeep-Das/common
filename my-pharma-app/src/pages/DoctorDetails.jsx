import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorDetails } from '../api';

export default function DoctorDetails() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctorData, setDoctorData] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorDetails();
  }, [doctorId]);

  const fetchDoctorDetails = async () => {
    try {
      const res = await getDoctorDetails(doctorId);
      setDoctorData(res.data);
    } catch (err) {
      console.error('Error fetching doctor details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (pharmacyId, slotId) => {
    setSelectedSlots({ [pharmacyId]: slotId });
  };

  const handleBookNow = (pharmacyId) => {
    const selectedSlot = selectedSlots[pharmacyId];
    if (selectedSlot) {
      alert(`Booking appointment for ${doctorData.doctor.doctor_name} at pharmacy ${pharmacyId} for slot ${selectedSlot}`);
    } else {
      alert('Please select a time slot first');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!doctorData) return <div className="p-6">Doctor not found</div>;

  return (
    <div className="p-6">
      <button 
        onClick={() => navigate('/doctors')}
        className="mb-4 text-blue-500 hover:underline"
      >
        ← Back to Doctors
      </button>
      
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">{doctorData.doctor.doctor_name}</h1>
        <p className="text-xl text-gray-600">{doctorData.doctor.department_name}</p>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Available Pharmacies</h2>
      
      <div className="space-y-6">
        {doctorData.pharmacies.map(pharmacy => (
          <div key={pharmacy.pharmacy_id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">{pharmacy.pharmacy_name}</h3>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Available Slots:</h4>
              <div className="grid grid-cols-3 gap-2">
                {pharmacy.slots.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => slot.available && handleSlotSelect(pharmacy.pharmacy_id, slot.id)}
                    disabled={!slot.available}
                    className={`p-2 rounded text-sm ${
                      selectedSlots[pharmacy.pharmacy_id] === slot.id
                        ? 'bg-blue-500 text-white'
                        : slot.available
                        ? 'bg-gray-100 hover:bg-gray-200'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
            
            <button
            onClick={() => handleBookNow(pharmacy.pharmacy_id)}
            disabled={!selectedSlots[pharmacy.pharmacy_id]}
            className={`px-4 py-2 rounded ${
                selectedSlots[pharmacy.pharmacy_id]
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            >
            Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
