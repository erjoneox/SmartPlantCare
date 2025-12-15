const express = require("express");
const router = express.Router();
const PlantRepository = require("../../repository/plant_repository");
const plantRepository = new PlantRepository();

// GET /notifications/water
router.get("/water", async (req, res) => {
  try {
    const userId = req.userId; // ensure auth middleware provided userId
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const plantsToWater = await plantRepository.getPlantsToWater(userId);
    return res.json(plantsToWater);
  } catch (error) {
    console.error("Error in /notifications/water:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
