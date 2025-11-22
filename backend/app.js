require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authController = require("./src/api/auth_controller");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/register", (req, res) => authController.register(req, res));
app.post("/login", (req, res) => authController.login(req, res));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
