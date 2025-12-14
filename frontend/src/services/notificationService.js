import axios from "axios";

export const notificationAPI = {
  getPlantsToWater: async () => {
    const response = await axios.get("/api/notifications/water"); // siguro URL e sakt
    return response.data;
  },
};
