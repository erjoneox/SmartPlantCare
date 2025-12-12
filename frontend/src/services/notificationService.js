import axios from "axios";

export const notificationAPI = {
  getPlantsToWater: async () => {
    const response = await axios.get("/api/notifications/water"); // siguro URL e saktë
    return response.data;
  },
};
