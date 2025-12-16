const express = require("express");
const router = express.Router();
const plantController = require("../controller/plant_controller");
const upload = require("../../middleware/upload_middleware");

// Create plant (with image)
router.post("/plants", upload.single("image"), (req, res) =>
  plantController.addPlant(req, res)
);

// Get plants by room
router.get("/plants/:roomId", (req, res) =>
  plantController.getPlants(req, res)
);

// Get single plant
router.get("/plant/:plantId", (req, res) => plantController.getPlant(req, res));

// Update plant (with optional image)
router.put("/plant/:plantId", upload.single("image"), (req, res) =>
  plantController.updatePlant(req, res)
);

// Delete plant
router.delete("/plant/:plantId", (req, res) =>
  plantController.deletePlant(req, res)
);

module.exports = router;
