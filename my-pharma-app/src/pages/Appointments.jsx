import React, { useState, useEffect } from "react";
import { getPatientAppointments } from "../api";
import AppointmentCard from "../components/AppointmentCard";

export default function Appointments() {
  const [appointments, setAppointments] = useState({
    upcoming: [],
    completed: [],
    cancelled: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await getPatientAppointments();
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">My Appointments</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">
            Upcoming ({appointments.upcoming.length})
          </h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {appointments.upcoming.length > 0 ? (
              appointments.upcoming.map((apt) => (
                <AppointmentCard key={apt.appointment_id} appointment={apt} />
              ))
            ) : (
              <p className="text-gray-500">No upcoming appointments</p>
            )}
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-green-800">
            Completed ({appointments.completed.length})
          </h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {appointments.completed.length > 0 ? (
              appointments.completed.map((apt) => (
                <AppointmentCard key={apt.appointment_id} appointment={apt} />
              ))
            ) : (
              <p className="text-gray-500">No completed appointments</p>
            )}
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-red-800">
            Cancelled ({appointments.cancelled.length})
          </h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {appointments.cancelled.length > 0 ? (
              appointments.cancelled.map((apt) => (
                <AppointmentCard key={apt.appointment_id} appointment={apt} />
              ))
            ) : (
              <p className="text-gray-500">No cancelled appointments</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
