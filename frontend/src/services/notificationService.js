import axios from "axios";
const API_URL = "http://localhost:5000";

export const notificationAPI = {
  getPlantsToWater: async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/api/notifications/water`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
