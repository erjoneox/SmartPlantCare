import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../services/SessionContext";
import { roomAPI, plantAPI } from "../services/roomService";
import { notificationAPI } from "../services/notificationService";
import Swal from "sweetalert2";

function Dashboard() {
  const { user, isLoggedIn } = useContext(SessionContext);
  const navigate = useNavigate();

  // Maps to convert between display names and DB IDs
  const seasonMap = {
    Spring: 1,
    Summer: 2,
    Fall: 3,
    Autumn: 3,
    Winter: 4,
    "Spring/Summer": 5,
    "Summer/Fall": 6,
    "Fall/Winter": 7,
    "Winter/Spring": 8,
  };
  const reverseSeasonMap = Object.fromEntries(
    Object.entries(seasonMap).map(([k, v]) => [v, k])
  );

  const monthMap = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };
  const reverseMonthMap = Object.fromEntries(
    Object.entries(monthMap).map(([k, v]) => [v, k])
  );

  const leafColorMap = {
    Green: 1,
    "Dark Green": 2,
    "Light Green": 3,
    "Yellow-Green": 4,
    Red: 5,
    Purple: 6,
    "Variegated (Green/White)": 7,
    "Variegated (Green/Yellow)": 8,
    Silver: 9,
    Bronze: 10,
  };
  const reverseLeafColorMap = Object.fromEntries(
    Object.entries(leafColorMap).map(([k, v]) => [v, k])
  );

  // Room state
  const [rooms, setRooms] = useState([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomForm, setRoomForm] = useState({ name: "", comment: "" });

  // Plant state
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [plants, setPlants] = useState({});
  const [editingPlantId, setEditingPlantId] = useState(null);
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
  const totalPlants = rooms.reduce(
    (sum, room) => sum + (room.numberOfPlants || 0),
    0
  );

  const handleAddRoom = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await roomAPI.createRoom(roomForm.name, roomForm.comment);

      // Show SweetAlert2 success popup (centered)
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Room added successfully!",
        showConfirmButton: false,
        timer: 1500,
      });

      // Reset form & close modal
      setRoomForm({ name: "", comment: "" });
      setShowRoomModal(false);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add room");
      console.error("Add room error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This room and all its plants will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#66BD68",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await roomAPI.deleteRoom(roomId);

      Swal.fire({
        title: "Deleted!",
        text: "Room deleted successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchRooms();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.error || "Failed to delete room",
        icon: "error",
      });
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

      // Map display values to DB IDs
      const seasonId = plantForm.bloomingSeason
        ? seasonMap[plantForm.bloomingSeason] ??
          (isNaN(Number(plantForm.bloomingSeason))
            ? null
            : Number(plantForm.bloomingSeason))
        : null;
      const monthId = plantForm.harvestMonth
        ? monthMap[plantForm.harvestMonth] ??
          (isNaN(Number(plantForm.harvestMonth))
            ? null
            : Number(plantForm.harvestMonth))
        : null;
      const leafColorId = plantForm.leafColor
        ? leafColorMap[plantForm.leafColor] ??
          (isNaN(Number(plantForm.leafColor))
            ? null
            : Number(plantForm.leafColor))
        : null;

      if (editingPlantId) {
        // Update existing plant
        await plantAPI.updatePlant(editingPlantId, {
          name: plantForm.name,
          type: plantForm.type,
          waterFrequency: parseInt(plantForm.waterFrequency),
          waterAlert: plantForm.waterAlert,
          imageFile: plantForm.imageFile,
          bloomingSeason: seasonId,
          fragranceLevel: plantForm.fragranceLevel || null,
          harvestMonth: monthId,
          leafColor: leafColorId,
        });
      } else {
        // Create new plant
        await plantAPI.createPlant(selectedRoom.roomId, {
          name: plantForm.name,
          type: plantForm.type,
          waterFrequency: parseInt(plantForm.waterFrequency),
          waterAlert: plantForm.waterAlert,
          imageFile: plantForm.imageFile,
          bloomingSeason: seasonId,
          fragranceLevel: plantForm.fragranceLevel || null,
          harvestMonth: monthId,
          leafColor: leafColorId,
        });
      }

      // Show SweetAlert2 success popup
      Swal.fire({
        position: "center",
        icon: "success",
        title: editingPlantId
          ? "Plant updated successfully!"
          : "Plant added successfully!",
        showConfirmButton: false,
        timer: 1500,
      });

      // Reset form & state
      setPlantForm({
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
      setShowPlantModal(false);
      setEditingPlantId(null);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add plant");
      console.error("Add plant error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlant = async (plantId, roomId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This plant will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#66BD68",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await plantAPI.deletePlant(plantId, roomId);

      Swal.fire({
        title: "Deleted!",
        text: "Plant deleted successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchRooms();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.error || "Failed to delete plant",
        icon: "error",
      });
    }
  };

  const openPlantModal = (room) => {
    // default: open empty add modal for the room
    setSelectedRoom(room);
    setEditingPlantId(null);
    setPlantForm({
      name: "",
      type: "",
      waterFrequency: "",
      waterAlert: true,
      imageFile: null,
      imageUrl: null,
      bloomingSeason: "",
      fragranceLevel: "",
      harvestMonth: "",
      leafColor: "",
    });
    setShowPlantModal(true);
  };

  const openEditPlantModal = async (room, plant) => {
    setSelectedRoom(room);
    setEditingPlantId(plant.plantId);
    // fetch latest plant data
    try {
      const plantDetails = await plantAPI.getPlant(plant.plantId);
      // convert numeric IDs returned from API back to human-readable names for the form
      let bloomingSeasonVal = "";
      if (
        plantDetails.bloomingSeason !== null &&
        plantDetails.bloomingSeason !== undefined
      ) {
        if (typeof plantDetails.bloomingSeason === "number") {
          bloomingSeasonVal =
            reverseSeasonMap[plantDetails.bloomingSeason] ||
            String(plantDetails.bloomingSeason);
        } else {
          bloomingSeasonVal = plantDetails.bloomingSeason;
        }
      }

      let harvestMonthVal = "";
      if (
        plantDetails.harvestMonth !== null &&
        plantDetails.harvestMonth !== undefined
      ) {
        if (typeof plantDetails.harvestMonth === "number") {
          harvestMonthVal =
            reverseMonthMap[plantDetails.harvestMonth] ||
            String(plantDetails.harvestMonth);
        } else {
          harvestMonthVal = plantDetails.harvestMonth;
        }
      }

      let leafColorVal = "";
      if (
        plantDetails.leafColor !== null &&
        plantDetails.leafColor !== undefined
      ) {
        if (typeof plantDetails.leafColor === "number") {
          leafColorVal =
            reverseLeafColorMap[plantDetails.leafColor] ||
            String(plantDetails.leafColor);
        } else {
          leafColorVal = plantDetails.leafColor;
        }
      }

      setPlantForm({
        name: plantDetails.name || "",
        type: plantDetails.type || plant.type || "",
        waterFrequency: plantDetails.waterFrequency || "",
        waterAlert:
          typeof plantDetails.waterAlert === "boolean"
            ? plantDetails.waterAlert
            : true,
        imageFile: null,
        imageUrl: plantDetails.imageUrl || plant.imageUrl || null,
        bloomingSeason: bloomingSeasonVal,
        fragranceLevel: plantDetails.fragranceLevel || "",
        harvestMonth: harvestMonthVal,
        leafColor: leafColorVal,
      });
      setShowPlantModal(true);
    } catch (err) {
      setError("Failed to load plant details");
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* --- WELCOME SECTION --- */}
        <div className="relative overflow-hidden bg-linear-to-br from-green-800 to-green-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl mb-12">
          <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-green-500 rounded-full blur-[80px] opacity-20"></div>
          <div className="absolute bottom-[-20%] left-[10%] w-40 h-40 bg-lime-400 rounded-full blur-[60px] opacity-10"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <span className="inline-block px-4 py-1.5 bg-green-500/20 border border-green-400/30 rounded-full text-green-300 text-xs font-bold uppercase tracking-widest mb-4">
                {new Date().getHours() < 12
                  ? "🌅 Good Morning"
                  : "☀️ Good Afternoon"}
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Welcome back,
                <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-green-300 to-lime-300">
                  {user?.name || "Plant Lover"}
                </span>
              </h1>
              <p className="mt-4 text-green-100/70 max-w-md font-light">
                Your indoor jungle is looking great today. You have{" "}
                {rooms.length} active zones currently being monitored.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-3xl text-center">
                <p className="text-green-300 text-xs font-bold uppercase mb-1">
                  Rooms
                </p>
                <p className="text-3xl font-black text-white">{rooms.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-3xl text-center">
                <p className="text-green-300 text-xs font-bold uppercase mb-1">
                  Plants
                </p>
                <p className="text-3xl font-black text-white">{totalPlants}</p>
              </div>
              <div className="col-span-2 bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-green-900/50">
                  📧
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-green-400 uppercase tracking-tighter">
                    Account Email
                  </p>
                  <p className="text-sm font-medium text-white truncate max-w-[200px]">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
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
                            onClick={() => openEditPlantModal(room, plant)}
                            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100"
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">
                                {plant.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Water: Every {plant.waterFrequency} days
                              </p>
                              {plant.type && (
                                <p className="text-xs text-gray-500">
                                  Type: {plant.type}
                                </p>
                              )}
                              {plant.type === "Flower" &&
                                plant.bloomingSeason && (
                                  <p className="text-xs text-gray-500">
                                    Blooming:{" "}
                                    {typeof plant.bloomingSeason === "number"
                                      ? reverseSeasonMap[
                                          plant.bloomingSeason
                                        ] || plant.bloomingSeason
                                      : plant.bloomingSeason}
                                    <br />
                                    {plant.fragranceLevel &&
                                      `Fragrance: ${plant.fragranceLevel}`}
                                  </p>
                                )}
                              {plant.type === "Fruit" && plant.harvestMonth && (
                                <p className="text-xs text-gray-500">
                                  Harvest:{" "}
                                  {typeof plant.harvestMonth === "number"
                                    ? reverseMonthMap[plant.harvestMonth] ||
                                      plant.harvestMonth
                                    : plant.harvestMonth}
                                </p>
                              )}
                              {plant.type === "Decorative" &&
                                plant.leafColor && (
                                  <p className="text-xs text-gray-500">
                                    Leaf Color:{" "}
                                    {typeof plant.leafColor === "number"
                                      ? reverseLeafColorMap[plant.leafColor] ||
                                        plant.leafColor
                                      : plant.leafColor}
                                  </p>
                                )}
                            </div>
                            {plant.imageUrl && (
                              <img
                                src={`http://localhost:5000/${plant.imageUrl}`}
                                alt={plant.name}
                                className="w-24 h-20 object-cover rounded ml-3"
                              />
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePlant(plant.plantId, room.roomId);
                              }}
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
              {editingPlantId
                ? `Edit Plant in ${selectedRoom.name}`
                : `Add Plant to ${selectedRoom.name}`}
            </h2>
            <p className="text-gray-600 mb-6">
              Fill in the plant details below
            </p>

            <form onSubmit={handleAddPlant} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Plant Name
                </label>
                <input
                  type="text"
                  value={plantForm.name}
                  onChange={(e) =>
                    setPlantForm({ ...plantForm, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="e.g., Rose, Tomato, Fern"
                />
              </div>

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
                  <option value="Flower">Flower</option>
                  <option value="Fruit">Fruit</option>
                  <option value="Decorative">Decorative</option>
                </select>
              </div>

              {plantForm.type === "Flower" && (
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

              {plantForm.type === "Fruit" && (
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

              {plantForm.type === "Decorative" && (
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
                  {loading
                    ? editingPlantId
                      ? "Saving..."
                      : "Adding..."
                    : editingPlantId
                    ? "Save Changes"
                    : "Add Plant"}
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
