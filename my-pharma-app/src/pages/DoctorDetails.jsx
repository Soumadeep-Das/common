import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getDoctorDetails, bookAppointment  } from '../api';

export default function DoctorDetails() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pharmacyFilter = searchParams.get('pharmacy');
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

  const handleBookNow = async (pharmacyId) => {
    const selectedSlot = selectedSlots[pharmacyId];
    if (selectedSlot) {
      try {
        const slotData = doctorData.pharmacies
          .find(p => p.pharmacy_id === pharmacyId)
          .slots.find(s => s.id === selectedSlot);
        
        await bookAppointment({
          doctorPharmacyTimingId: slotData.doctor_pharmacy_timing_id,
          appointmentDate: slotData.date
        });
        
        alert('Appointment booked successfully!');
        fetchDoctorDetails();
      } catch (err) {
        alert('Failed to book appointment');
      }
    }
  };

  const handleBack = () => {
    if (pharmacyFilter) {
      navigate(`/pharmacies/${pharmacyFilter}`);
    } else {
      navigate('/doctors');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!doctorData) return <div className="p-6">Doctor not found</div>;

  const filteredPharmacies = pharmacyFilter 
    ? doctorData.pharmacies.filter(p => p.pharmacy_id === parseInt(pharmacyFilter))
    : doctorData.pharmacies;

  return (
    <div className="p-6">
      <button 
        onClick={handleBack}
        className="mb-4 text-blue-500 hover:underline"
      >
        ← Back to {pharmacyFilter ? 'Pharmacy' : 'Doctors'}
      </button>
      
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">{doctorData.doctor.doctor_name}</h1>
        <p className="text-xl text-gray-600">{doctorData.doctor.department_name}</p>
      </div>

      {!pharmacyFilter && (
        <h2 className="text-2xl font-semibold mb-4">Available Pharmacies</h2>
      )}

      
      <div className="space-y-6">
        {filteredPharmacies.map(pharmacy => (
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
                    className={`p-3 rounded text-sm border ${
                      selectedSlots[pharmacy.pharmacy_id] === slot.id
                        ? 'bg-blue-500 text-white border-blue-600'
                        : slot.available
                        ? 'bg-white hover:bg-gray-50 border-gray-200'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                    }`}
                  >
                    <div className="text-purple-600 font-medium">
                      {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </div>
                    <div className="text-gray-700 text-xs">{slot.date}</div>
                    <div className="text-green-600 font-semibold">{slot.time}</div>
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
