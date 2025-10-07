import React, { useState, useEffect } from "react";

export default function AppointmentDetailsModal({ appointment, isOpen, onClose, onCancel }) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Reset confirmation state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setShowConfirmation(false);
    }
  }, [isOpen]);

  if (!isOpen || !appointment) return null;

  const handleCancelClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmCancel = () => {
    onCancel(appointment.appointment_id);
    setShowConfirmation(false);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Appointment Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-xl">
            ×
          </button>
        </div>
        
        {!showConfirmation ? (
          <>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Doctor</h3>
                <p className="text-base">{appointment.doctor_name}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Department</h3>
                <p className="text-base">{appointment.department_name}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Pharmacy</h3>
                <p className="text-base">{appointment.pharmacy_name}</p>
                <button className="text-blue-600 hover:text-blue-800 text-sm underline">
                  Get Directions
                </button>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Date & Time</h3>
                <p className="text-base">{new Date(appointment.appointment_date).toLocaleDateString()}</p>
                <p className="text-base">{appointment.appointment_time}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Status</h3>
                <p className="text-base capitalize">{appointment.patient_status}</p>
              </div>
            </div>
            
            <div className="mt-8 flex gap-4">
              <button 
                onClick={onClose}
                className="flex-1 bg-gray-500 text-white py-3 rounded hover:bg-gray-600"
              >
                Close
              </button>
              <button 
                onClick={handleCancelClick}
                className="flex-1 bg-red-500 text-white py-3 rounded hover:bg-red-600"
              >
                Cancel Appointment
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-4">Confirm Cancellation</h3>
              <p className="text-base text-gray-600 mb-8">
                Are you sure you want to cancel this appointment?
              </p>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={handleCancelConfirmation}
                className="flex-1 bg-gray-500 text-white py-3 rounded hover:bg-gray-600"
              >
                No, Keep It
              </button>
              <button 
                onClick={handleConfirmCancel}
                className="flex-1 bg-red-500 text-white py-3 rounded hover:bg-red-600"
              >
                Yes, Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
