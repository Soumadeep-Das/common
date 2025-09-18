export default function DoctorCard({ doctor }) {
    return (
      <div className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition">
        <h3 className="text-xl font-semibold">{doctor.doctor_name}</h3>
        <h2 className="text-xl font-semibold">{doctor.department_name}</h2>
        {/* Add more doctor details here */}
      </div>
    );
  }
  