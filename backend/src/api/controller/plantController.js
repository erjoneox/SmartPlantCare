const PlantRepository = require("../repository/plant_repository");
const FlowerRepository = require("../repository/flower_repository");
const FruitRepository = require("../repository/fruit_repository");
const DecorativeRepository = require("../repository/decorative_repository");

class PlantController {
  async create(req, res) {
    const {
      roomId,
      name,
      waterFrequency,
      waterAlert,
      plantType,
      seasonID,
      fragranceLevel,
      harvestMonthID,
      leafColorID,
    } = req.body;

    try {
      const plant = await PlantRepository.create({
        roomId,
        name,
        waterFrequency,
        waterAlert,
      });
      const plantId = plant.plantId;

      if (plantType === "flower") {
        await FlowerRepository.create({ plantId, seasonID, fragranceLevel });
      } else if (plantType === "fruit") {
        await FruitRepository.create({ plantId, harvestMonthID });
      } else if (plantType === "decorative") {
        await DecorativeRepository.create({ plantId, leafColorID });
      }

      res.status(201).json({ message: "Plant saved successfully", plantId });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new PlantController();
