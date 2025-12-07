const PlantRepository = require("../../repository/plant_repository");
const RoomRepository = require("../../repository/room_repository");
const PlantService = require("../../service/plant_service");

const plantRepository = new PlantRepository();
const roomRepository = new RoomRepository();
const plantService = new PlantService(plantRepository, roomRepository);

class PlantController {
  async addPlant(req, res) {
    try {
      const {
        roomId,
        name,
        type,
        waterFrequency,
        waterAlert,
        imageUrl,
        bloomingSeason,
        fragranceLevel,
        harvestMonth,
        leafColor,
      } = req.body;

      // Validate required fields
      if (!name || !type || !waterFrequency) {
        return res
          .status(400)
          .json({ error: "Name, type, and waterFrequency are required" });
      }

      // Verify room belongs to user
      const room = await roomRepository.getRoomById(roomId, req.userId);
      if (!room) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const plant = await plantService.addPlant(roomId, {
        name,
        type,
        waterFrequency,
        waterAlert,
        imageUrl,
        bloomingSeason,
        fragranceLevel,
        harvestMonth,
        leafColor,
      });
      res.status(201).json(plant);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getPlants(req, res) {
    try {
      const { roomId } = req.params;

      // Verify room belongs to user
      const room = await roomRepository.getRoomById(
        parseInt(roomId),
        req.userId
      );
      if (!room) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const plants = await plantService.getPlants(parseInt(roomId));
      res.json(plants);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getPlant(req, res) {
    try {
      const { plantId } = req.params;
      const plant = await plantService.getPlant(parseInt(plantId));
      res.json(plant);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updatePlant(req, res) {
    try {
      const { plantId } = req.params;
      const { name, waterFrequency, waterAlert, imageUrl, sunLightTimer } =
        req.body;

      await plantService.updatePlant(
        parseInt(plantId),
        name,
        waterFrequency,
        waterAlert,
        imageUrl,
        sunLightTimer
      );
      res.json({ message: "Plant updated successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deletePlant(req, res) {
    try {
      const { plantId } = req.params;
      const { roomId } = req.body;

      // Verify room belongs to user
      const room = await roomRepository.getRoomById(roomId, req.userId);
      if (!room) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await plantService.deletePlant(parseInt(plantId), roomId);
      res.json({ message: "Plant deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateSunlightTimer(req, res) {
    try {
      const { plantId } = req.params;
      const { startTime, endTime } = req.body;

      await plantService.updateSunlightTimer(
        parseInt(plantId),
        startTime,
        endTime
      );
      res.json({ message: "Sunlight timer updated" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new PlantController();
