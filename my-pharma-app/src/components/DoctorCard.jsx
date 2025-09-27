import { useNavigate } from 'react-router-dom';

export default function DoctorCard({ doctor }) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/doctors/${doctor.doctor_id}`);
  };

  return (
    <div 
      className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer"
      onClick={handleClick}
    >
      <h3 className="text-xl font-semibold">{doctor.doctor_name}</h3>
      <h2 className="text-xl font-semibold">{doctor.department_name}</h2>
    </div>
  );
}
