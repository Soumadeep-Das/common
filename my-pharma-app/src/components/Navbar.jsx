import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload(); // Ensures state resets everywhere
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container-main flex justify-between items-center">
        <h1 className="text-xl font-bold">HealthApp</h1>
        <div className="flex gap-4 items-center">
          {isLoggedIn && (
            <>
              <span className="font-semibold">{user?.name || "My Profile"}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded ml-4"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
