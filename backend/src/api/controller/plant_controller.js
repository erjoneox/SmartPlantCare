const PlantRepository = require("../../repository/plant_repository");
const RoomRepository = require("../../repository/room_repository");
const UserRepository = require("../../repository/user_repository");
const PlantService = require("../../service/plant_service");

const plantRepository = new PlantRepository();
const roomRepository = new RoomRepository();
const userRepository = new UserRepository();
const plantService = new PlantService(
  plantRepository,
  roomRepository,
  userRepository
);

class PlantController {
  async addPlant(req, res) {
    try {
      const {
        roomId,
        name,
        type,
        waterFrequency,
        waterAlert,
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

      // Create plant with water alert scheduling
      const plant = await plantService.addPlant(
        roomId,
        {
          name,
          type,
          waterFrequency,
          waterAlert,
          imageUrl: null,
          bloomingSeason,
          fragranceLevel,
          harvestMonth,
          leafColor,
        },
        req.userId
      );

      return res.status(201).json(plant);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getPlants(req, res) {
    try {
      const { roomId } = req.params;

      const room = await roomRepository.getRoomById(
        parseInt(roomId),
        req.userId
      );
      if (!room) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const plants = await plantService.getPlants(parseInt(roomId));
      return res.json(plants);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getPlant(req, res) {
    try {
      const { plantId } = req.params;
      const plant = await plantService.getPlant(parseInt(plantId));

      return res.json(plant);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async updatePlant(req, res) {
    try {
      const { plantId } = req.params;
      const { name, waterFrequency, waterAlert, sunLightTimer } = req.body;

      const imageUrl = req.file ? req.file.path : null;

      await plantService.updatePlant(
        parseInt(plantId),
        name,
        waterFrequency,
        waterAlert,
        imageUrl,
        sunLightTimer
      );

      return res.json({ message: "Plant updated successfully" });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async deletePlant(req, res) {
    try {
      const { plantId } = req.params;
      const { roomId } = req.body;

      const room = await roomRepository.getRoomById(roomId, req.userId);
      if (!room) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await plantService.deletePlant(parseInt(plantId), roomId);

      return res.json({ message: "Plant deleted successfully" });
    } catch (error) {
      return res.status(400).json({ error: error.message });
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

      return res.json({ message: "Sunlight timer updated" });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new PlantController();
