require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const authController = require("./src/api/controller/auth_controller");
const roomController = require("./src/api/controller/room_controller");
const plantController = require("./src/api/controller/plant_controller");
const plantRoutes = require("./src/api/routes/plantRoutes");
const cron = require("node-cron");
const PlantRepository = require("./src/repository/plant_repository");
const UserRepository = require("./src/repository/user_repository");
const { sendWateringNotification } = require("./src/service/email_service");

const plantRepository = new PlantRepository();
const userRepository = new UserRepository();

// Cron job që ekzekutohet çdo ditë në ora 08:00
cron.schedule("0 8 * * *", async () => {
  console.log("Checking plants for watering...");
    try {
    const plants = await plantRepository.getAllPlants();

    const today = new Date();

    for (const plant of plants) {
      const lastWatered = new Date(plant.lastWatered);
      const diffTime = Math.abs(today - lastWatered);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Kontrollo nëse kanë kaluar 3 ditë
      if (diffDays % 3 === 0) {
        // Merr emailin e përdoruesit
        const user = await userRepository.getUserById(plant.userId);

        if (user && user.email) {
          await sendWateringNotification(user.email, plant.name);
        }
      }
    }
  } catch (err) {
    console.error("Error sending watering notifications:", err);
  }
});

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", plantRoutes);

// per me bo verify JWT token
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
app.post("/plants", verifyToken, (req, res) =>
  plantController.addPlant(req, res)
);
app.get("/rooms/:roomId/plants", verifyToken, (req, res) =>
  plantController.getPlants(req, res)
);
app.get("/plants/:plantId", verifyToken, (req, res) =>
  plantController.getPlant(req, res)
);
app.put("/plants/:plantId", verifyToken, (req, res) =>
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
