import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../services/SessionContext";
import { addPlant } from "../services/plantService";

function Dashboard() {
  const { user, isLoggedIn } = useContext(SessionContext);
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [plantForm, setPlantForm] = useState({
    name: "",
    waterFrequency: 1,
    waterAlert: 1,
  });

  const handlePlantChange = (e) => {
    const { name, value } = e.target;
    setPlantForm({ ...plantForm, [name]: value });
  };

  const handleAddPlant = async (e) => {
    e.preventDefault();
    try {
      await addPlant(plantForm);
      setShowForm(false);
      setPlantForm({ name: "", waterFrequency: 1, waterAlert: 1 });
      alert("Plant added successfully!");
    } catch (error) {
      console.error("Error adding plant:", error);
      alert("Failed to add plant.");
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

        <div className="grid grid-cols-1">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              My Plants
            </h3>
            <p className="text-gray-600">Manage your plant collection</p>
            <button
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              onClick={() => setShowForm(true)}
            >
              + Add Plant
            </button>

            {showForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Add New Plant
                </h3>
                <form onSubmit={handleAddPlant} className="space-y-4">
                  {/* Plant basics */}
                  <div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Plant Name"
                      value={plantForm.name}
                      onChange={handlePlantChange}
                      required
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="waterFrequency"
                      placeholder="Water Frequency (days)"
                      value={plantForm.waterFrequency}
                      onChange={handlePlantChange}
                      required
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <select
                      name="waterAlert"
                      value={plantForm.waterAlert}
                      onChange={handlePlantChange}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value={1}>Enable Water Alert</option>
                      <option value={0}>Disable Water Alert</option>
                    </select>
                  </div>

                  {/* Plant type selector */}
                  <div>
                    <select
                      name="plantType"
                      value={plantForm.plantType}
                      onChange={handlePlantChange}
                      required
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="">Select Plant Type</option>
                      <option value="flower">Flower</option>
                      <option value="fruit">Fruit</option>
                      <option value="decorative">Decorative</option>
                    </select>
                  </div>

                  {/* Conditional fields */}
                  {plantForm.plantType === "flower" && (
                    <>
                      <div>
                        <select
                          name="seasonID"
                          value={plantForm.seasonID}
                          onChange={handlePlantChange}
                          className="w-full px-3 py-2 border rounded"
                        >
                          <option value="">Select Blooming Season</option>
                          <option value={1}>Spring</option>
                          <option value={2}>Summer</option>
                          <option value={3}>Fall</option>
                          <option value={4}>Winter</option>
                          <option value={5}>Spring/Summer</option>
                          <option value={6}>Summer/Fall</option>
                          <option value={7}>Fall/Winter</option>
                          <option value={8}>Winter/Spring</option>
                        </select>
                      </div>
                      <div>
                        <input
                          type="text"
                          name="fragranceLevel"
                          placeholder="Fragrance Level"
                          value={plantForm.fragranceLevel}
                          onChange={handlePlantChange}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                    </>
                  )}

                  {plantForm.plantType === "fruit" && (
                    <div>
                      <select
                        name="harvestMonthID"
                        value={plantForm.harvestMonthID}
                        onChange={handlePlantChange}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="">Select Harvest Month</option>
                        <option value={1}>January</option>
                        <option value={2}>February</option>
                        <option value={3}>March</option>
                        <option value={4}>April</option>
                        <option value={5}>May</option>
                        <option value={6}>June</option>
                        <option value={7}>July</option>
                        <option value={8}>August</option>
                        <option value={9}>September</option>
                        <option value={10}>October</option>
                        <option value={11}>November</option>
                        <option value={12}>December</option>
                      </select>
                    </div>
                  )}

                  {plantForm.plantType === "decorative" && (
                    <div>
                      <select
                        name="leafColorID"
                        value={plantForm.leafColorID}
                        onChange={handlePlantChange}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="">Select Leaf Color</option>
                        <option value={1}>Green</option>
                        <option value={2}>Dark Green</option>
                        <option value={3}>Light Green</option>
                        <option value={4}>Yellow-Green</option>
                        <option value={5}>Red</option>
                        <option value={6}>Purple</option>
                        <option value={7}>Variegated (Green/White)</option>
                        <option value={8}>Variegated (Green/Yellow)</option>
                        <option value={9}>Silver</option>
                        <option value={10}>Bronze</option>
                      </select>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    Save Plant
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
