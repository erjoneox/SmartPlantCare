require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/api/routes/authRoutes");
const plantRoutes = require("./src/routes/plant_routes");

module.exports = app;

const app = express();

app.use(cors());
app.use(express.json());
app.use("/", authRoutes);
app.use("/", plantRoutes);

app.post("/register", (req, res) => authController.register(req, res));
app.post("/login", (req, res) => authController.login(req, res));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
