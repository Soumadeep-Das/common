import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatAppointmentDate, getTodayDateString } from '../../utils/dateUtils';

export default function MyDoctorBookings() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorDetails();
    fetchAvailableDates();
  }, [doctorId]);

//   useEffect(() => {
//     if (selectedDate) {
//       fetchAppointments();
//     }
//   }, [selectedDate]);

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

const fetchAvailableDates = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3000/api/pharmacy/doctors/${doctorId}/appointment-dates`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    console.log('Available dates from API:', data.data);
    setAvailableDates(data.data);
    
    // Set default date: today if available, otherwise next upcoming date
    const today = getTodayDateString();
    console.log('Today is:', today);
    const defaultDate = data.data.find(d => {
      const dateStr = new Date(d.appointment_date).toISOString().split('T')[0];
      console.log('Comparing:', dateStr, 'with today:', today);
      return dateStr === today;
    })?.appointment_date || data.data[0]?.appointment_date;
    
    console.log('Default date selected:', defaultDate);
    if (defaultDate) {
      const convertedDate = new Date(defaultDate).toISOString().split('T')[0];
      console.log('Converted date:', convertedDate);
      setSelectedDate(convertedDate);
      fetchAppointments(convertedDate);
    }
  } catch (error) {
    console.error('Error fetching available dates:', error);
  }
};




const fetchAppointments = async (dateToFetch = selectedDate) => {
  try {
    // Convert the selected date to match the displayed date (add 1 day)
    const displayDate = new Date(dateToFetch + 'T00:00:00Z');
    displayDate.setDate(displayDate.getDate() + 1);
    const apiDate = displayDate.toISOString().split('T')[0];
    
    console.log('Original date:', dateToFetch, 'API date:', apiDate);
    
    const token = localStorage.getItem('token');
    const url = `http://localhost:3000/api/pharmacy/doctors/${doctorId}/appointments?date=${apiDate}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setAppointments(data.data);
  } catch (error) {
    console.error('Error fetching appointments:', error);
  }
};



  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="mb-4 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        ← Back
      </button>
      
      <h1 className="text-2xl font-bold mb-8">
        Bookings for {doctor?.doctor_name}
      </h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Date:
        </label>
            <select
            value={selectedDate}
            onChange={(e) => {
            console.log('Dropdown changed to:', e.target.value);
            setSelectedDate(e.target.value);
            fetchAppointments(e.target.value);
            }}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          <option value="">Select a date</option>
            {availableDates.map(dateObj => {
            const optionValue = new Date(dateObj.appointment_date).toISOString().split('T')[0];
            console.log('Dropdown option - Original:', dateObj.appointment_date, 'Converted:', optionValue);
            return (
                <option key={dateObj.appointment_date} value={optionValue}>
                {formatAppointmentDate(dateObj.appointment_date)}
                </option>
            );
            })}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          {selectedDate ? `Appointments for ${formatAppointmentDate(selectedDate)}` : 'Select a date to view appointments'}
        </h3>
        
        <div className="space-y-3">
          {appointments.length > 0 ? (
            appointments.map((appointment) => (
              <div key={appointment.appointment_id} className="bg-gray-50 p-4 rounded border">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{appointment.patient_name}</p>
                    <p className="text-sm text-gray-600">
                      Time: {appointment.appointment_time}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: <span className={`px-2 py-1 rounded text-xs ${
                        appointment.patient_status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.patient_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {appointment.patient_status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">
              {selectedDate ? 'No appointments found for this date' : 'Please select a date'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
