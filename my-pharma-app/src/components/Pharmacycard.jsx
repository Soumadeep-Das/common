import { useNavigate } from "react-router-dom";

export default function PharmacyCard({ pharmacy }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/pharmacies/${pharmacy.pharmacy_id}`);
  };

  return (
    <div 
      className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer"
      onClick={handleClick}
    >
      <h3 className="text-xl font-semibold">{pharmacy.pharmacy_name}</h3>
    </div>
  );
}
