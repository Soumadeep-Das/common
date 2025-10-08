import { useNavigate } from 'react-router-dom';

export default function DoctorCard({ doctor, fromPharmacy }) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    const url = fromPharmacy 
      ? `/doctors/${doctor.doctor_id}?pharmacy=${fromPharmacy}`
      : `/doctors/${doctor.doctor_id}`;
    navigate(url);
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
