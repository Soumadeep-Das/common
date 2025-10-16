// my-pharma-app/src/components/pharmacy/PharmacyDoctorCard.jsx
export default function PharmacyDoctorCard({ doctor }) {
  return (
    <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{doctor.doctor_name}</h3>
          <p className="text-blue-600 font-medium">{doctor.department_name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Fees</p>
          <p className="text-lg font-bold text-green-600">{Math.round(doctor.fees||500.00)}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="border-t pt-2">
          <p className="text-sm text-gray-500">Sitting Details</p>
          <p className="text-sm text-gray-700">{doctor.sitting_details}</p>
        </div>
      </div>
    </div>
  );
}
