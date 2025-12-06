import axios from "axios";
const API_URL = "http://localhost:5000/plants";

export const addPlant = (plantData) => {
  return axios.post(API_URL, plantData);
};
