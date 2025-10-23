import { useParams } from 'react-router-dom';

export default function AddDoctorToPharmacy() {
  const { doctorId } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Add Doctor to Pharmacy</h1>
      
      <div className="bg-white p-8 rounded-xl shadow text-center">
        <p className="text-lg text-gray-600 mb-4">
          This feature will be enhanced soon.
        </p>
        <p className="text-sm text-gray-500">
          Doctor ID: {doctorId}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Here you will be able to set up timing schedules and add the doctor to your pharmacy.
        </p>
      </div>
    </div>
  );
}
