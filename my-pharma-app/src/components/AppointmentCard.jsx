import React from "react";

export default function AppointmentCard({ appointment }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">Dr. {appointment.doctor_name}</h3>
        <span className={`px-2 py-1 rounded text-sm ${
          appointment.patient_status === 'confirmed' ? 'bg-green-100 text-green-800' :
          appointment.patient_status === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {appointment.patient_status}
        </span>
      </div>
      <p className="text-gray-600 mb-1">{appointment.department_name}</p>
      <p className="text-gray-600 mb-1">{appointment.pharmacy_name}</p>
      <div className="flex justify-between text-sm text-gray-500">
        <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
        <span>{appointment.appointment_time}</span>
      </div>
    </div>
  );
}
