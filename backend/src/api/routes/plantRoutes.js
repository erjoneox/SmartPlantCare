const express = require("express");
const router = express.Router();
const PlantController = require("../api/plant_controller");

router.post("/plants", PlantController.create);

module.exports = router;
