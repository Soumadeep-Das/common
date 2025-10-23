import { useNavigate } from 'react-router-dom';

export default function AllDoctorCard({ doctor, isConnected }) {
  const navigate = useNavigate();

  const handleAddToPharmacy = () => {
    navigate(`/pharmacy/add-doctor/${doctor.doctor_id}`);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <div className="flex justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800">{doctor.doctor_name}</h3>
          <p className="text-blue-600 font-medium">{doctor.department_name}</p>
        </div>
        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
      </div>
      
      {isConnected ? (
        <div className="bg-green-50 border border-green-200 rounded py-2 px-4 text-center">
          <p className="text-green-600 font-medium text-sm">Already added to pharmacy</p>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            disabled
            className="flex-1 bg-gray-300 text-gray-500 py-2 px-4 rounded text-sm cursor-not-allowed"
          >
            View More
          </button>
          <button
            onClick={handleAddToPharmacy}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded text-sm hover:bg-blue-600 transition"
          >
            Add to My Pharmacy
          </button>
        </div>
      )}
    </div>
  );
}
