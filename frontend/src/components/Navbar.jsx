import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const linkClass = (path) =>
    `block px-3 py-2 rounded-md text-base font-medium ${
      location.pathname === path
        ? "bg-gray-900 text-white"
        : "text-gray-300 hover:bg-gray-700 hover:text-white"
    }`;

  return (
    <nav className="bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 text-white font-bold text-xl">
            My App
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4">
            <Link to="/" className={linkClass("/")}>
              Home
            </Link>
            <Link to="/register" className={linkClass("/register")}>
              Register
            </Link>
            <Link to="/login" className={linkClass("/login")}>
              Login
            </Link>
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
        <div className="md:hidden bg-gray-800 px-2 pt-2 pb-3 space-y-1">
          <Link to="/" className={linkClass("/")}>
            Home
          </Link>
          <Link to="/register" className={linkClass("/register")}>
            Register
          </Link>
          <Link to="/login" className={linkClass("/login")}>
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
