export default function PharmacyCard({ pharmacy }) {
    return (
      <div className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition">
        <h3 className="text-xl font-semibold">{pharmacy.pharmacy_name}</h3>
        {/* Add more pharmacy details here */}
      </div>
    );
  }
  