const express = require("express");
const router = express.Router();
const PlantRepository = require("../../repository/plant_repository");
const plantRepository = new PlantRepository();

// GET /notifications/water
router.get("/water", async (req, res) => {
  try {
    const userId = req.userId; // sigurohu që ke middleware për auth
    const plantsToWater = await plantRepository.getPlantsToWater(userId); // do krijojmë këtë funksion
    res.json(plantsToWater);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
