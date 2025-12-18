import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SessionContext } from "../services/SessionContext";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionTime, setSessionTime] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, logout, getTimeRemaining, user } =
    useContext(SessionContext);

  useEffect(() => {
    if (!isLoggedIn) {
      setSessionTime(null);
      return;
    }

    // Update remaining session time
    const interval = setInterval(() => {
      const remaining = getTimeRemaining();
      if (remaining) {
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        setSessionTime(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn, getTimeRemaining]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsOpen(false);
  };

  const linkClass = (path) =>
    `block px-3 py-2 rounded-md text-base font-medium ${
      location.pathname === path
        ? "bg-gray-300 text-green-800"
        : "text-white hover:bg-gray-200 hover:text-green-800"
    }`;

  return (
    <nav className="bg-green-600/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="shrink-0">
            <img
              src="/logoSmartPlantCareText.png"
              alt="SmartPlantCare Logo"
              className="w-32 h-auto rounded-lg cursor-pointer hover:scale-105 transition-transform duration-300"
              style={{
                filter: `
      drop-shadow(1px 0 0 white)
      drop-shadow(-1px 0 0 white)
      drop-shadow(0 1px 0 white)
      drop-shadow(0 -1px 0 white)
    `,
              }}
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4 items-center">
            <Link to="/" className={linkClass("/")}>
              Home
            </Link>
            {!isLoggedIn ? (
              <>
                <Link to="/register" className={linkClass("/register")}>
                  Register
                </Link>
                <Link to="/login" className={linkClass("/login")}>
                  Login
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className={linkClass("/dashboard")}>
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-base font-medium text-white 
             bg-green-700 hover:bg-green-900 transition cursor-pointer"
                >
                  Logout
                </button>

                {sessionTime && (
                  <span className="text-black-500 px-3 py-2 text-sm font-semibold">
                    Sessioni juaj mbaron edhe : {sessionTime}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-green-600 px-2 pt-2 pb-3 space-y-1">
          <Link to="/" className={linkClass("/")}>
            Home
          </Link>
          {!isLoggedIn ? (
            <>
              <Link to="/register" className={linkClass("/register")}>
                Register
              </Link>
              <Link to="/login" className={linkClass("/login")}>
                Login
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className={linkClass("/dashboard")}>
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-red-500 transition"
              >
                Logout
              </button>
              <div className="block px-3 py-2 text-base font-medium text-white">
                Welcome, {user?.name || "User"}
              </div>
              {sessionTime && (
                <div className="block px-3 py-2 text-sm font-semibold text-black-500">
                  Sessioni juaj mbaron edhe : {sessionTime}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
