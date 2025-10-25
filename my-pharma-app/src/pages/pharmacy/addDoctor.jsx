import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function AddDoctorToPharmacy() {
  const [pharmacyRawSlots, setPharmacyRawSlots] = useState({});
  const { doctorId } = useParams();
  const [doctorData, setDoctorData] = useState(null);
  const [pharmacyData, setPharmacyData] = useState(null);
  const [unavailableSlots, setUnavailableSlots] = useState({ doctor: {}, pharmacy: {} });
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedDay, setSelectedDay] = useState('All');
  const [formData, setFormData] = useState({
    occurrence: '',
    day: '',
    patientCount: '',
    roomNumber: '',
    week: '',
    timeSlot: ''
  });
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [dropdownData, setDropdownData] = useState({
    occurrences: [],
    weeks: [],
    days: [],
    timeSlots: [],
    rooms: []
  });
  


  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    if (dropdownData.rooms.length === 1) {
      setFormData(prev => ({ ...prev, roomNumber: dropdownData.rooms[0].toString() }));
    }
  }, [dropdownData.rooms]);

  useEffect(() => {
    fetchData();
  }, [doctorId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // First check if doctor is already added to this pharmacy
      const myDoctorsResponse = await fetch(`http://localhost:3000/api/pharmacy/my-doctors`, { headers });
      const myDoctorsResult = await myDoctorsResponse.json();
      const isAlreadyAdded = myDoctorsResult.data.some(d => d.doctor_id == doctorId);
      
      if (isAlreadyAdded) {
        setDoctorData({ error: 'Doctor is already added to your pharmacy' });
        setLoading(false);
        return;
      }

      // Fetch doctor details from all doctors
      const doctorResponse = await fetch(`http://localhost:3000/api/pharmacy/all-doctors`, { headers });
      const doctorResult = await doctorResponse.json();
      const doctor = doctorResult.data.find(d => d.doctor_id == doctorId);
      
      if (!doctor) {
        setDoctorData({ error: 'Doctor not found' });
        setLoading(false);
        return;
      }
      
      setDoctorData(doctor);

      // Fetch dropdown data
      const dropdownResponse = await fetch(`http://localhost:3000/api/pharmacy/form-data`, { headers });
      const dropdownResult = await dropdownResponse.json();
      setDropdownData(dropdownResult.data);

      // Rest of the existing fetch logic...
      const pharmacyResponse = await fetch(`http://localhost:3000/api/auth/me-specific`, { headers });
      const pharmacyResult = await pharmacyResponse.json();
      setPharmacyData({
        name: pharmacyResult.name,
        location: pharmacyResult.address || 'Address not available'
      });

      const doctorUnavailabilityResponse = await fetch(`http://localhost:3000/api/doctor/${doctorId}/unavailability`, { headers });
      const doctorUnavailabilityResult = await doctorUnavailabilityResponse.json();
      
      const pharmacyUnavailabilityResponse = await fetch(`http://localhost:3000/api/pharmacy/unavailability`, { headers });
      const pharmacyUnavailabilityResult = await pharmacyUnavailabilityResponse.json();

      const doctorSlots = processUnavailabilityData(doctorUnavailabilityResult.data);
      const pharmacySlots = processPharmacyUnavailabilityData(pharmacyUnavailabilityResult.data);

      // Get available rooms
      const rooms = Object.keys(pharmacySlots);
      setAvailableRooms(rooms);
      setSelectedRoom(rooms[0] || ''); // Select first room by default
      
      setUnavailableSlots({ doctor: doctorSlots, pharmacy: pharmacySlots });

    } catch (error) {
      console.error('Error fetching data:', error);
      setDoctorData({ error: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

const filterAvailableTimeSlots = (patientCount, selectedRoom, selectedDay, occurrence, selectedWeek) => {
  if (!patientCount) return [];
  
  const targetHours = patientCount === '15' ? 1 : 0;
  const targetMinutes = patientCount === '15' ? 30 : 30;
  
  const filteredSlots = dropdownData.timeSlots.filter(slot => 
    slot.duration.hours === targetHours && slot.duration.minutes === targetMinutes
  );
  
  if (!selectedRoom || !pharmacyRawSlots[selectedRoom]) return filteredSlots;
  
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  return filteredSlots.filter(slot => {
    const newSlotStart = slot.starting_time;
    const newSlotEnd = slot.ending_time;
    const newSlotStartMin = timeToMinutes(newSlotStart);
    const newSlotEndMin = timeToMinutes(newSlotEnd);
    
    const checkConflict = (roomData) => {
      if (!roomData) return false;
      
      const allBusySlots = [
        ...roomData.daily,
        ...roomData.weekly,
        ...Object.values(roomData.monthly).flat()
      ];
      
      return allBusySlots.some(busySlot => {
        const busyTimes = busySlot.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
        if (!busyTimes) return false;
        
        const busyStart = busyTimes[1] + ':00';
        const busyEnd = busyTimes[2] + ':00';
        const busyStartMin = timeToMinutes(busyStart);
        const busyEndMin = timeToMinutes(busyEnd);
        
        // Check overlap
        const hasOverlap = newSlotStartMin < busyEndMin && newSlotEndMin > busyStartMin;
        
        // Check 30-minute gap rule
        const gapAfterBusy = Math.abs(newSlotStartMin - busyEndMin) < 30;
        const gapBeforeBusy = Math.abs(busyStartMin - newSlotEndMin) < 30;
        
        return hasOverlap || gapAfterBusy || gapBeforeBusy;
      });
    };
    
    if (occurrence === '1') {
      return !daysOfWeek.some(day => {
        const roomData = pharmacyRawSlots[selectedRoom]?.[day];
        return checkConflict(roomData);
      });
    } else if (occurrence === '3') {
      if (!selectedDay || !selectedWeek) return true;
      
      const roomData = pharmacyRawSlots[selectedRoom]?.[selectedDay];
      if (!roomData) return true;
      
      const weeklySlots = roomData.monthly[selectedWeek] || [];
      const monthlyRoomData = {
        daily: roomData.daily,
        weekly: roomData.weekly,
        monthly: { [selectedWeek]: weeklySlots }
      };
      
      return !checkConflict(monthlyRoomData);
    } else {
      if (!selectedDay) return true;
      
      const roomData = pharmacyRawSlots[selectedRoom]?.[selectedDay];
      return !checkConflict(roomData);
    }
  });
};




  const handleFormChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    
    if (field === 'patientCount' || field === 'roomNumber' || field === 'day' || field === 'occurrence' || field === 'week') {
      const canFilter = newFormData.patientCount && (
        newFormData.occurrence === '1' || // Daily
        (newFormData.occurrence === '2' && newFormData.day) || // Weekly
        (newFormData.occurrence === '3' && newFormData.day && newFormData.week) // Monthly
      );
      
      if (canFilter) {
        const filteredSlots = filterAvailableTimeSlots(
          newFormData.patientCount, 
          newFormData.roomNumber || (dropdownData.rooms.length === 1 ? '1' : dropdownData.rooms[0]), 
          newFormData.day,
          newFormData.occurrence,
          newFormData.week
        );
        setAvailableTimeSlots(filteredSlots);
      } else {
        setAvailableTimeSlots([]);
      }
      newFormData.timeSlot = '';
    }
    
    if (field === 'occurrence') {
      if (value === '1') {
        newFormData.day = '';
        newFormData.week = '';
      } else if (value === '2') {
        newFormData.week = '';
      }
    }
    
    setFormData(newFormData);
  };

  const processUnavailabilityData = (sittingDetails) => {
    const slots = {};
    daysOfWeek.forEach(day => slots[day] = []);

    // Group monthly occurrences by day and time slot
    const monthlySlots = {};

    sittingDetails.forEach(sitting => {
      const timeSlot = `${sitting.starting_time.slice(0,5)} - ${sitting.ending_time.slice(0,5)}`;
      
      if (sitting.occurrence_name === 'daily') {
        // Add to all days
        daysOfWeek.forEach(day => {
          if (!slots[day].includes(timeSlot)) {
            slots[day].push(timeSlot);
          }
        });
      } else if (sitting.occurrence_name === 'weekly') {
        // Add to specific day only
        const dayName = sitting.day_name;
        if (slots[dayName] && !slots[dayName].includes(timeSlot)) {
          slots[dayName].push(timeSlot);
        }
      } else if (sitting.occurrence_name === 'monthly') {
        // Group by day and time slot
        const dayName = sitting.day_name;
        const key = `${dayName}_${timeSlot}`;
        
        if (!monthlySlots[key]) {
          monthlySlots[key] = {
            dayName,
            timeSlot,
            weeks: []
          };
        }
        monthlySlots[key].weeks.push(sitting.week_number);
      }
    });

    // Process monthly slots
    Object.values(monthlySlots).forEach(({ dayName, timeSlot, weeks }) => {
      const uniqueWeeks = [...new Set(weeks)].sort();
      const weekText = uniqueWeeks.map(w => {
        const ordinals = ['', '1st', '2nd', '3rd', '4th'];
        return ordinals[w] || `${w}th`;
      }).join(' & ');
      
      const monthlySlot = `${timeSlot} (${weekText} week)`;
      
      if (slots[dayName]) {
        slots[dayName].push(monthlySlot);
      }
    });

    return slots;
  };

  const processPharmacyUnavailabilityData = (sittingDetails) => {
    const roomSlots = {};
    
    sittingDetails.forEach(sitting => {
      const roomNumber = sitting.room_number || 'No Room';
      if (!roomSlots[roomNumber]) {
        roomSlots[roomNumber] = {};
        daysOfWeek.forEach(day => {
          roomSlots[roomNumber][day] = {
            daily: [],
            weekly: [],
            monthly: {}
          };
        });
      }
    });

    sittingDetails.forEach(sitting => {
      const roomNumber = sitting.room_number || 'No Room';
      const timeSlot = `${sitting.starting_time.slice(0,5)} - ${sitting.ending_time.slice(0,5)}`;
      const dayName = sitting.day_name;
      
      if (sitting.occurrence_name === 'daily') {
        roomSlots[roomNumber][dayName].daily.push(timeSlot);
      } else if (sitting.occurrence_name === 'weekly') {
        roomSlots[roomNumber][dayName].weekly.push(timeSlot);
      } else if (sitting.occurrence_name === 'monthly') {
        const weekNum = sitting.week_number;
        if (!roomSlots[roomNumber][dayName].monthly[weekNum]) {
          roomSlots[roomNumber][dayName].monthly[weekNum] = [];
        }
        roomSlots[roomNumber][dayName].monthly[weekNum].push(timeSlot);
      }
    });

    // Store raw data in state
    setPharmacyRawSlots(roomSlots);

    // Convert to display format
    const displaySlots = {};
    Object.keys(roomSlots).forEach(room => {
      displaySlots[room] = {};
      daysOfWeek.forEach(day => {
        displaySlots[room][day] = [
          ...roomSlots[room][day].daily,
          ...roomSlots[room][day].weekly,
          ...Object.entries(roomSlots[room][day].monthly).map(([week, slots]) => {
            const ordinals = ['', '1st', '2nd', '3rd', '4th'];
            return slots.map(slot => `${slot} (${ordinals[week]} week)`);
          }).flat()
        ];
      });
    });
    
    return displaySlots;
  };


  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!doctorData || doctorData.error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Cannot Add Doctor</h2>
          <p className="text-red-600">
            {doctorData?.error || 'Doctor not found'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Add Doctor to Pharmacy</h1>
      
      {/* Section 1: Doctor Details */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">Doctor Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
            <p className="text-lg font-medium">{doctorData.doctor_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <p className="text-lg font-medium">{doctorData.department_name}</p>
          </div>
        </div>
      </div>

      {/* Section 2: Pharmacy Details */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4 text-green-600">Pharmacy Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pharmacy Name</label>
            <p className="text-lg font-medium">{pharmacyData?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <p className="text-lg font-medium">{pharmacyData?.location}</p>
          </div>
        </div>
      </div>

      {/* Section 3: Unavailable Time Slots */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Unavailable Time Slots (Sitting Schedules)</h2>
        
        {/* Day Selector */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedDay('All')}
              className={`w-6 h-6 rounded-full text-xs font-medium transition-colors ${
                selectedDay === 'All' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {daysOfWeek.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`w-6 h-6 rounded-full text-xs font-medium transition-colors ${
                  selectedDay === day 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day.slice(0, 1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          
          {/* Pharmacy Unavailable Slots - Left Side */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-green-700">Pharmacy Busy Times</h3>
            
            {/* Room Selector */}
            {availableRooms.length > 0 ? (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {availableRooms.map(room => (
                    <button
                      key={room}
                      onClick={() => setSelectedRoom(room)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        selectedRoom === room 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      R-{room}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-4 text-sm text-gray-500">
                No room data available for this pharmacy
              </div>
            )}

            {/* Day-wise Schedule for Selected Room */}
            <div className="space-y-3">
              {(selectedDay === 'All' ? daysOfWeek : [selectedDay]).map(day => (
                <div key={day} className="border rounded-lg p-3">
                  <div className="font-medium text-sm text-gray-700 mb-2">{day}</div>
                  <div className="space-y-1">
                    {selectedRoom && unavailableSlots.pharmacy[selectedRoom] && unavailableSlots.pharmacy[selectedRoom][day]?.length > 0 ? (
                      unavailableSlots.pharmacy[selectedRoom][day].map((slot, index) => (
                        <div key={index} className="text-sm bg-red-50 text-red-700 px-2 py-1 rounded">
                          {slot}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-green-600">Available all day</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Unavailable Slots - Right Side */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-blue-700">Doctor Busy Times</h3>
            <div className="space-y-3">
              {(selectedDay === 'All' ? daysOfWeek : [selectedDay]).map(day => (
                <div key={day} className="border rounded-lg p-3">
                  <div className="font-medium text-sm text-gray-700 mb-2">{day}</div>
                  <div className="space-y-1">
                    {unavailableSlots.doctor[day]?.length > 0 ? (
                      unavailableSlots.doctor[day].map((slot, index) => (
                        <div key={index} className="text-sm bg-red-50 text-red-700 px-2 py-1 rounded">
                          {slot}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-green-600">Available all day</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Sitting Details */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4 text-purple-600">Sitting Details</h2>
        <div className="grid grid-cols-3 gap-4">
          
          {/* Occurrence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Occurrence</label>
            <select 
              value={formData.occurrence}
              onChange={(e) => handleFormChange('occurrence', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select Occurrence</option>
              {dropdownData.occurrences.map(occ => (
                <option key={occ.occurrence_id} value={occ.occurrence_id}>
                  {occ.occurrence_name.charAt(0).toUpperCase() + occ.occurrence_name.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Day - Hidden for daily */}
          {formData.occurrence !== '1' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
              <select 
                value={formData.day}
                onChange={(e) => handleFormChange('day', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select Day</option>
                {dropdownData.days.map(day => (
                  <option key={day.day_id} value={day.day_name}>{day.day_name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Week - Only for monthly */}
          {formData.occurrence === '3' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Week</label>
              <select 
                value={formData.week}
                onChange={(e) => handleFormChange('week', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select Week</option>
                {dropdownData.weeks.map(week => (
                  <option key={week.week_id} value={week.week_id}>
                    {week.week_number === 1 ? '1st' : week.week_number === 2 ? '2nd' : week.week_number === 3 ? '3rd' : `${week.week_number}th`} Week
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Patient Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient Count</label>
            <select 
              value={formData.patientCount}
              onChange={(e) => handleFormChange('patientCount', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select Count</option>
              <option value="15">15 Patients</option>
              <option value="20">20 Patients</option>
            </select>
          </div>

          {/* Room Number - Only if multiple rooms */}
          {dropdownData.rooms.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
              <select 
                value={formData.roomNumber}
                onChange={(e) => handleFormChange('roomNumber', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select Room</option>
                {dropdownData.rooms.map(room => (
                  <option key={room} value={room}>Room {room}</option>
                ))}
              </select>
            </div>
          )}

          {/* Time Slot */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
            <select 
              value={formData.timeSlot}
              onChange={(e) => handleFormChange('timeSlot', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={!formData.patientCount}
            >
              <option value="">Select Time Slot</option>
              {availableTimeSlots.map(slot => (
                <option key={slot.time_slot_id} value={slot.time_slot_id}>
                  {slot.starting_time.slice(0,5)} - {slot.ending_time.slice(0,5)}
                </option>
              ))}
            </select>
          </div>

        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
            Add Sitting Schedule
          </button>
        </div>
      </div>

    </div>
  );
}
