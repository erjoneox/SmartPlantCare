import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../services/SessionContext";

function Dashboard() {
  const { user, isLoggedIn } = useContext(SessionContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <span className="text-3xl font-bold text-gray-800">
            Welcome, {user?.name || "User"}
          </span>
          <div className="mt-4 text-gray-600">
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>User ID:</strong> {user?.id}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 ">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              My Plants
            </h3>
            <p className="text-gray-600">Manage your plant collection</p>
          </div>

          {/* <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Plant Care Tips
            </h3>
            <p className="text-gray-600">Learn best practices for plant care</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Settings
            </h3>
            <p className="text-gray-600">Manage your account settings</p>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
