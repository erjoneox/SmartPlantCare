import axios from "axios";

const API_URL = "http://localhost:5000";

// Room Services
export const roomAPI = {
  createRoom: async (name, comment) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/rooms`,
      { name, comment },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  getRooms: async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getRoom: async (roomId) => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/rooms/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  updateRoom: async (roomId, name, comment) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `${API_URL}/rooms/${roomId}`,
      { name, comment },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  deleteRoom: async (roomId) => {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${API_URL}/rooms/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Plant Services
export const plantAPI = {
  createPlant: async (roomId, plantData) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("roomId", roomId);
    formData.append("name", plantData.name);
    formData.append("type", plantData.type);
    formData.append("waterFrequency", plantData.waterFrequency);
    formData.append("waterAlert", plantData.waterAlert);
    formData.append("bloomingSeason", plantData.bloomingSeason || "");
    formData.append("fragranceLevel", plantData.fragranceLevel || "");
    formData.append("harvestMonth", plantData.harvestMonth || "");
    formData.append("leafColor", plantData.leafColor || "");
    if (plantData.imageFile) {
      formData.append("image", plantData.imageFile);
    }

    const response = await axios.post(`${API_URL}/plants`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getPlants: async (roomId) => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/rooms/${roomId}/plants`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getPlant: async (plantId) => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/plants/${plantId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  updatePlant: async (plantId, plantData) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("name", plantData.name);
    formData.append("type", plantData.type);
    formData.append("waterFrequency", plantData.waterFrequency);
    formData.append("waterAlert", plantData.waterAlert);
    formData.append("bloomingSeason", plantData.bloomingSeason || "");
    formData.append("fragranceLevel", plantData.fragranceLevel || "");
    formData.append("harvestMonth", plantData.harvestMonth || "");
    formData.append("leafColor", plantData.leafColor || "");
    if (plantData.imageFile) {
      formData.append("image", plantData.imageFile);
    }

    const response = await axios.put(`${API_URL}/plants/${plantId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deletePlant: async (plantId, roomId) => {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${API_URL}/plants/${plantId}`, {
      data: { roomId },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  updateSunlightTimer: async (plantId, startTime, endTime) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/plants/${plantId}/sunlight`,
      {
        startTime,
        endTime,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },
};
