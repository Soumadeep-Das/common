import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getProfile } from "../api";

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      getProfile().then(data => setUser(data));
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  const getUserIcon = () => {
    const role = user?.role?.toLowerCase();
    switch (role) {
      case 'patient':
        return '👤';
      case 'pharmacy':
        return '💊';
      case 'doctor':
        return '👨⚕️';
      default:
        return '👤';
    }
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container-main flex justify-between items-center">
        <button
            className="text-xl font-bold bg-transparent border-none cursor-pointer hover:text-blue-300 active:text-blue-400 transition-colors"
            onClick={() => navigate("/")}
        >
            HealthApp
        </button>
        <div className="flex gap-4 items-center">
          {isLoggedIn && user && (
            <>
              <span className="text-white">Welcome, {user.name}!</span>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors"
                >
                  {getUserIcon()}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
