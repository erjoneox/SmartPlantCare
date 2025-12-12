import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../services/SessionContext";
import { roomAPI, plantAPI } from "../services/roomService";
import { useEffect } from "react";
import { notificationAPI } from "../services/notificationService";

function Dashboard() { 
  const { user, isLoggedIn } = useContext(SessionContext);
  const navigate = useNavigate();

  seEffect(() => {
  const checkWatering = async () => {
    try {
      const plantsToWater = await notificationAPI.getPlantsToWater();
      plantsToWater.forEach((plant) => {
        new Notification(`Water your plant: ${plant.name}`, {
          body: `It's time to water ${plant.name}! 🌱`,
        });
      });
    } catch (err) {
      console.error("Failed to fetch watering notifications", err);
    }
  };

  // Kërkon leje për notifikime
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  checkWatering();
  const interval = setInterval(checkWatering, 6 * 60 * 60 * 1000); // kontrollo çdo 6 ore
  return () => clearInterval(interval);
}, []);

  // Room state
  const [rooms, setRooms] = useState([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomForm, setRoomForm] = useState({ name: "", comment: "" });

  // Plant state
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [plants, setPlants] = useState({});
  const [plantForm, setPlantForm] = useState({
    name: "",
    type: "",
    waterFrequency: "",
    waterAlert: true,
    imageFile: null,
    bloomingSeason: "",
    fragranceLevel: "",
    harvestMonth: "",
    leafColor: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      fetchRooms();
    }
  }, [isLoggedIn, navigate]);

  const fetchRooms = async () => {
    try {
      const roomsData = await roomAPI.getRooms();
      setRooms(roomsData);
      // Fetch plants for each room
      const plantsData = {};
      for (const room of roomsData) {
        plantsData[room.roomId] = await plantAPI.getPlants(room.roomId);
      }
      setPlants(plantsData);
    } catch (err) {
      setError("Failed to fetch rooms");
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await roomAPI.createRoom(roomForm.name, roomForm.comment);
      setSuccess("Room added successfully!");
      setRoomForm({ name: "", comment: "" });
      setShowRoomModal(false);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add room");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      await roomAPI.deleteRoom(roomId);
      setSuccess("Room deleted successfully!");
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete room");
    }
  };

  const handleAddPlant = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validate required fields
      if (!plantForm.name || !plantForm.type || !plantForm.waterFrequency) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }
      const formData = new FormData();

          formData.append("roomId", selectedRoom.roomId);
          formData.append("name", plantForm.name);
          formData.append("type", plantForm.type);
          formData.append("waterFrequency", plantForm.waterFrequency);
          formData.append("waterAlert", plantForm.waterAlert ? "true" : "false");

          formData.append("bloomingSeason", plantForm.bloomingSeason || "");
          formData.append("fragranceLevel", plantForm.fragranceLevel || "");
          formData.append("harvestMonth", plantForm.harvestMonth || "");
          formData.append("leafColor", plantForm.leafColor || "");

              if (plantForm.imageFile) {
              formData.append("image", plantForm.imageFile);
    }
       await plantAPI.createPlant(formData);


      setSuccess("Plant added successfully!");
      setPlantForm({
        name: "",
        type: "",
        waterFrequency: "",
        waterAlert: true,
        bloomingSeason: "",
        fragranceLevel: "",
        harvestMonth: "",
        leafColor: "",
      });
      setShowPlantModal(false);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add plant");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlant = async (plantId, roomId) => {
    if (!window.confirm("Are you sure you want to delete this plant?")) return;
    try {
      await plantAPI.deletePlant(plantId, roomId);
      setSuccess("Plant deleted successfully!");
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete plant");
    }
  };

  const openPlantModal = (room) => {
    setSelectedRoom(room);
    setShowPlantModal(true);
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {user?.name || "User"}
          </h1>
          <div className="mt-4 text-gray-600">
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Total Rooms:</strong> {rooms.length}
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-500">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-500">
            {success}
          </div>
        )}

        {/* Rooms Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Rooms</h2>
            <button
              onClick={() => setShowRoomModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition cursor-pointer"
            >
              + Add Room
            </button>
          </div>

          {rooms.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 text-lg">
                No rooms yet. Create one to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div
                  key={room.roomId}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
                >
                  {/* Room Header */}
                  <div className="bg-linear-to-r from-green-500 to-green-600 p-6 text-white">
                    <h3 className="text-xl font-bold">{room.name}</h3>
                    {room.comment && (
                      <p className="text-sm text-green-100 mt-2">
                        {room.comment}
                      </p>
                    )}
                    <p className="text-sm font-semibold mt-3">
                      {room.numberOfPlants}{" "}
                      {room.numberOfPlants === 1 ? "Plant" : "Plants"}
                    </p>
                  </div>

                  {/* Plants List */}
                  <div className="p-6">
                    {plants[room.roomId] && plants[room.roomId].length > 0 ? (
                      <div className="space-y-3 mb-4">
                        {plants[room.roomId].map((plant) => (
                          <div
                            key={plant.plantId}
                            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">
                                {plant.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Water: Every {plant.waterFrequency} days
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleDeletePlant(plant.plantId, room.roomId)
                              }
                              className="text-red-500 hover:text-red-700 text-sm font-semibold ml-2 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm mb-4">
                        No plants in this room yet.
                      </p>
                    )}

                    {/* Room Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openPlantModal(room)}
                        className="flex-1 bg-green-600 hover:green-700 text-white font-semibold py-2 px-3 rounded-lg text-sm transition cursor-pointer"
                      >
                        + Add Plant
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.roomId)}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg text-sm transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Add a New Room
            </h2>

            <form onSubmit={handleAddRoom} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Room Name
                </label>
                <input
                  type="text"
                  value={roomForm.name}
                  onChange={(e) =>
                    setRoomForm({ ...roomForm, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="e.g., Living Room, Bedroom"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Comment (Optional)
                </label>
                <textarea
                  value={roomForm.comment}
                  onChange={(e) =>
                    setRoomForm({ ...roomForm, comment: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="e.g., Sunny room on the south side"
                  rows="3"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Creating..." : "Create Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plant Modal */}
      {showPlantModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Add Plant to {selectedRoom.name}
            </h2>
            <p className="text-gray-600 mb-6">
              Fill in the plant details below
            </p>

            <form onSubmit={handleAddPlant} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Plant Type
                </label>
                <select
                  value={plantForm.type}
                  onChange={(e) =>
                    setPlantForm({ ...plantForm, type: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="">Select type</option>
                  <option value="flower">Flower</option>
                  <option value="fruit">Fruit</option>
                  <option value="decorative">Decorative</option>
                </select>
              </div>

              {plantForm.type === "flower" && (
                <>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Blooming Season
                    </label>
                    <select
                      value={plantForm.bloomingSeason}
                      onChange={(e) =>
                        setPlantForm({
                          ...plantForm,
                          bloomingSeason: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    >
                      <option value="">Select season</option>
                      <option>Spring</option>
                      <option>Summer</option>
                      <option>Fall</option>
                      <option>Winter</option>
                      <option>Spring/Summer</option>
                      <option>Summer/Fall</option>
                      <option>Fall/Winter</option>
                      <option>Winter/Spring</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Fragrance Level
                    </label>
                    <input
                      type="text"
                      value={plantForm.fragranceLevel}
                      onChange={(e) =>
                        setPlantForm({
                          ...plantForm,
                          fragranceLevel: e.target.value,
                        })
                      }
                      placeholder="e.g., High, Medium, Low"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                </>
              )}

              {plantForm.type === "fruit" && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Harvest Month
                  </label>
                  <select
                    value={plantForm.harvestMonth}
                    onChange={(e) =>
                      setPlantForm({
                        ...plantForm,
                        harvestMonth: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <option value="">Select month</option>
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}

              {plantForm.type === "decorative" && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Leaf Color
                  </label>
                  <select
                    value={plantForm.leafColor}
                    onChange={(e) =>
                      setPlantForm({ ...plantForm, leafColor: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <option value="">Select color</option>
                    <option>Green</option>
                    <option>Dark Green</option>
                    <option>Light Green</option>
                    <option>Yellow-Green</option>
                    <option>Red</option>
                    <option>Purple</option>
                    <option>Variegated (Green/White)</option>
                    <option>Variegated (Green/Yellow)</option>
                    <option>Silver</option>
                    <option>Bronze</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Water Frequency (days)
                </label>
                <input
                  type="number"
                  value={plantForm.waterFrequency}
                  onChange={(e) =>
                    setPlantForm({
                      ...plantForm,
                      waterFrequency: e.target.value,
                    })
                  }
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="e.g., 3 (every 3 days)"
                />
              </div>

             <div>
              <label className="block text-gray-700 font-semibold mb-2">
               Plant Image
              </label>
  
            <input
                 type="file"
                 accept="image/*"
                 onChange={(e) =>
                  setPlantForm({
                 ...plantForm,
                 imageFile: e.target.files[0],
           })
         }
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
  />
</div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={plantForm.waterAlert}
                  onChange={(e) =>
                    setPlantForm({ ...plantForm, waterAlert: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600"
                />
                <label className="ml-2 text-gray-700 font-semibold">
                  Enable water alerts
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPlantModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:green-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 cursor-pointer "
                >
                  {loading ? "Adding..." : "Add Plant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )} 
    </div>
  );
}

export default Dashboard;
