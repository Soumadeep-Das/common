export default function Card({ title, description }) {
    return (
      <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
    );
  }
  