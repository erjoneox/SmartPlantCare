require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const authController = require("./src/api/controller/auth_controller");
const roomController = require("./src/api/controller/room_controller");
const plantController = require("./src/api/controller/plant_controller");
const plantRoutes = require("./src/api/routes/plantRoutes");
const notificationRoutes = require("./src/api/routes/notificationRoutes");
const upload = require("./src/middleware/upload_middleware");
const cron = require("node-cron");
const PlantRepository = require("./src/repository/plant_repository");
const UserRepository = require("./src/repository/user_repository");
const { sendWateringNotification } = require("./src/service/email_service");

const plantRepository = new PlantRepository();
const userRepository = new UserRepository();

const app = express();

app.use(cors());
app.use(express.json());
// Serve uploaded files statically
app.use("/upls", express.static("upls"));
// verifyToken middleware (used by many routes)
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "changeme");
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

app.use("/api", plantRoutes);
app.use("/api/notifications", verifyToken, notificationRoutes);

// Auth routes i lojm qitu niher
app.post("/register", (req, res) => authController.register(req, res));
app.post("/login", (req, res) => authController.login(req, res));

// Room routes i lojm qitu niher
app.post("/rooms", verifyToken, (req, res) => roomController.addRoom(req, res));
app.get("/rooms", verifyToken, (req, res) => roomController.getRooms(req, res));
app.get("/rooms/:roomId", verifyToken, (req, res) =>
  roomController.getRoom(req, res)
);
app.put("/rooms/:roomId", verifyToken, (req, res) =>
  roomController.updateRoom(req, res)
);
app.delete("/rooms/:roomId", verifyToken, (req, res) =>
  roomController.deleteRoom(req, res)
);

// Plant routes I lojm niher qitu
app.post("/plants", verifyToken, upload.single("image"), (req, res) =>
  plantController.addPlant(req, res)
);
app.get("/rooms/:roomId/plants", verifyToken, (req, res) =>
  plantController.getPlants(req, res)
);
app.get("/plants/:plantId", verifyToken, (req, res) =>
  plantController.getPlant(req, res)
);
app.put("/plants/:plantId", verifyToken, upload.single("image"), (req, res) =>
  plantController.updatePlant(req, res)
);
app.delete("/plants/:plantId", verifyToken, (req, res) =>
  plantController.deletePlant(req, res)
);
app.post("/plants/:plantId/sunlight", verifyToken, (req, res) =>
  plantController.updateSunlightTimer(req, res)
);

module.exports = app;

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
