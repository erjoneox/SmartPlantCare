const fs = require("fs");
const path = require("path");
const { sendWateringNotification } = require("./email_service");

class PlantService {
  constructor(plantRepository, roomRepository, userRepository = null) {
    this.plantRepository = plantRepository;
    this.roomRepository = roomRepository;
    this.userRepository = userRepository;
    this.waterAlertIntervals = {}; // Store intervals for water alerts
  }

  async addPlant(roomId, plantData, userId) {
    const {
      name,
      type,
      waterFrequency,
      waterAlert = true,
      imageUrl = null,
      bloomingSeason = null,
      fragranceLevel = null,
      harvestMonth = null,
      leafColor = null,
    } = plantData;

    if (!roomId || !name || !type || waterFrequency === undefined) {
      throw new Error(
        "Room ID, plant name, type, and water frequency are required"
      );
    }

    // Create the plant record
    const plant = await this.plantRepository.createPlant(
      roomId,
      name,
      waterFrequency,
      waterAlert,
      imageUrl
    );

    // Create type-specific records (coerce/map values to numeric IDs)
    try {
      const seasonMap = { Spring: 1, Summer: 2, Autumn: 3, Fall: 3, Winter: 4 };
      const monthMap = {
        January: 1,
        February: 2,
        March: 3,
        April: 4,
        May: 5,
        June: 6,
        July: 7,
        August: 8,
        September: 9,
        October: 10,
        November: 11,
        December: 12,
      };
      const leafColorMap = { Green: 1, Red: 2, Yellow: 3, Variegated: 4 };

      const parseId = (val, map) => {
        if (val === null || val === undefined) return null;
        if (typeof val === "number") return val;
        if (!isNaN(parseInt(val))) return parseInt(val);
        if (map && map[val]) return map[val];
        return null;
      };

      const seasonId = parseId(bloomingSeason, seasonMap);
      const harvestMonthId = parseId(harvestMonth, monthMap);
      const leafColorId = parseId(leafColor, leafColorMap);

      // Create type-specific records only if required ID is present
      if (type === "Flower" && seasonId) {
        console.log(
          "createFlower called with plantId:",
          plant.plantId,
          "seasonId:",
          seasonId,
          "fragranceLevel:",
          fragranceLevel
        );
        await this.plantRepository.createFlower(
          plant.plantId,
          seasonId,
          fragranceLevel
        );
      } else if (type === "Fruit" && harvestMonthId) {
        console.log(
          "createFruit called with plantId:",
          plant.plantId,
          "harvestMonthId:",
          harvestMonthId
        );
        await this.plantRepository.createFruit(plant.plantId, harvestMonthId);
      } else if (type === "Decorative" && leafColorId) {
        console.log(
          "createDecorate called with plantId:",
          plant.plantId,
          "leafColorId:",
          leafColorId
        );
        await this.plantRepository.createDecorate(plant.plantId, leafColorId);
      }
    } catch (error) {
      console.error("Error creating type-specific record:", error);
    }

    await this.roomRepository.updatePlantCount(roomId);

    // Schedule water alert if enabled
    if (waterAlert && userId && this.userRepository) {
      try {
        await this.scheduleWaterAlert(
          plant.plantId,
          name,
          waterFrequency,
          userId
        );
      } catch (error) {
        console.error("Error scheduling water alert:", error);
      }
    }

    return plant;
  }

  async scheduleWaterAlert(plantId, plantName, waterFrequency, userId) {
    try {
      // Get user email from database
      const user = await this.userRepository.getUserById(userId);
      if (!user || !user.email) {
        console.error("User email not found for water alert scheduling");
        return;
      }

      // Convert water frequency (days) to milliseconds
      const alertInterval = waterFrequency * 60 * 1000;

      // Clear any existing interval for this plant
      if (this.waterAlertIntervals[plantId]) {
        clearInterval(this.waterAlertIntervals[plantId]);
      }

      this.waterAlertIntervals[plantId] = setInterval(async () => {
        try {
          await sendWateringNotification(user.email, plantName);
        } catch (error) {
          console.error(
            `Error sending water alert email for plant ${plantId}:`,
            error
          );
        }
      }, alertInterval);

      console.log(
        `Water alert scheduled for plant ${plantId} (${plantName}) - Alert every ${waterFrequency} days to ${user.email}`
      );
    } catch (error) {
      console.error("Error in scheduleWaterAlert:", error);
    }
  }

  clearWaterAlert(plantId) {
    if (this.waterAlertIntervals[plantId]) {
      clearInterval(this.waterAlertIntervals[plantId]);
      delete this.waterAlertIntervals[plantId];
    }
  }

  async getPlants(roomId) {
    if (!roomId) {
      throw new Error("Room ID is required");
    }
    const plants = await this.plantRepository.getPlantsByRoomId(roomId);

    // Fetch type-specific details for each plant
    for (const plant of plants) {
      try {
        if (plant.type === "Flower") {
          const flower = await this.plantRepository.getFlowerByPlantId(
            plant.plantId
          );
          if (flower) {
            plant.bloomingSeason =
              flower.seasonId ??
              flower.bloomingSeasonId ??
              flower.seasonID ??
              null;
            plant.fragranceLevel = flower.fragranceLevel ?? null;
          }
        } else if (plant.type === "Fruit") {
          const fruit = await this.plantRepository.getFruitByPlantId(
            plant.plantId
          );
          if (fruit) {
            plant.harvestMonth =
              fruit.monthId ??
              fruit.harvestMonthId ??
              fruit.HarvestMonthID ??
              null;
          }
        } else if (plant.type === "Decorative") {
          const deco = await this.plantRepository.getDecorativeByPlantId(
            plant.plantId
          );
          if (deco) {
            plant.leafColor = deco.leafColorId ?? deco.LeafColorID ?? null;
          }
        }
      } catch (err) {
        console.error(
          `Error fetching type-specific details for plant ${plant.plantId}:`,
          err
        );
      }
    }

    return plants;
  }

  async getPlant(plantId) {
    if (!plantId) {
      throw new Error("Plant ID is required");
    }
    const plant = await this.plantRepository.getPlantById(plantId);
    if (!plant) {
      throw new Error("Plant not found");
    }

    // fetch type-specific details if present
    try {
      if (plant.type === "Flower") {
        const flower = await this.plantRepository.getFlowerByPlantId(plantId);
        if (flower) {
          plant.bloomingSeason =
            flower.seasonId ??
            flower.bloomingSeasonId ??
            flower.seasonID ??
            null;
          plant.fragranceLevel = flower.fragranceLevel ?? null;
        }
      } else if (plant.type === "Fruit") {
        const fruit = await this.plantRepository.getFruitByPlantId(plantId);
        if (fruit) {
          plant.harvestMonth =
            fruit.monthId ??
            fruit.harvestMonthId ??
            fruit.HarvestMonthID ??
            null;
        }
      } else if (plant.type === "Decorative") {
        const deco = await this.plantRepository.getDecorativeByPlantId(plantId);
        if (deco) {
          plant.leafColor = deco.leafColorId ?? deco.LeafColorID ?? null;
        }
      }
    } catch (err) {
      console.error(
        "Error fetching type-specific details for plant",
        plantId,
        err
      );
    }

    return plant;
  }

  async updatePlant(plantId, plantData, userId = null) {
    const {
      name,
      type,
      waterFrequency,
      waterAlert = true,
      imageUrl = null,
      bloomingSeason = null,
      fragranceLevel = null,
      harvestMonth = null,
      leafColor = null,
    } = plantData;

    if (!plantId || !name || waterFrequency === undefined) {
      throw new Error("Plant ID, name, and water frequency are required");
    }

    const success = await this.plantRepository.updatePlant(
      plantId,
      name,
      waterFrequency,
      waterAlert,
      imageUrl
    );

    if (!success) {
      throw new Error("Failed to update plant");
    }

    // Remove existing type-specific records and recreate based on provided type
    try {
      await this.plantRepository.deleteFlowerByPlantId(plantId);
      await this.plantRepository.deleteFruitByPlantId(plantId);
      await this.plantRepository.deleteDecorativeByPlantId(plantId);

      const seasonMap = { Spring: 1, Summer: 2, Autumn: 3, Fall: 3, Winter: 4 };
      const monthMap = {
        January: 1,
        February: 2,
        March: 3,
        April: 4,
        May: 5,
        June: 6,
        July: 7,
        August: 8,
        September: 9,
        October: 10,
        November: 11,
        December: 12,
      };
      const leafColorMap = { Green: 1, Red: 2, Yellow: 3, Variegated: 4 };

      const parseId = (val, map) => {
        if (val === null || val === undefined) return null;
        if (typeof val === "number") return val;
        if (!isNaN(parseInt(val))) return parseInt(val);
        if (map && map[val]) return map[val];
        return null;
      };

      const seasonId = parseId(bloomingSeason, seasonMap);
      const harvestMonthId = parseId(harvestMonth, monthMap);
      const leafColorId = parseId(leafColor, leafColorMap);

      // On update, recreate type-specific rows if IDs present
      if (type === "Flower" && seasonId) {
        console.log(
          "update createFlower called with plantId:",
          plantId,
          "seasonId:",
          seasonId,
          "fragranceLevel:",
          fragranceLevel
        );
        await this.plantRepository.createFlower(
          plantId,
          seasonId,
          fragranceLevel
        );
      } else if (type === "Fruit" && harvestMonthId) {
        console.log(
          "update createFruit called with plantId:",
          plantId,
          "harvestMonthId:",
          harvestMonthId
        );
        await this.plantRepository.createFruit(plantId, harvestMonthId);
      } else if (type === "Decorative" && leafColorId) {
        console.log(
          "update createDecorate called with plantId:",
          plantId,
          "leafColorId:",
          leafColorId
        );
        await this.plantRepository.createDecorate(plantId, leafColorId);
      }
    } catch (error) {
      console.error("Error updating type-specific record:", error);
    }

    // Reschedule or clear water alerts
    if (this.userRepository && userId) {
      if (waterAlert) {
        await this.scheduleWaterAlert(plantId, name, waterFrequency, userId);
      } else {
        this.clearWaterAlert(plantId);
      }
    }

    return success;
  }

  async deletePlant(plantId, roomId) {
    if (!plantId || !roomId) {
      throw new Error("Plant ID and Room ID are required");
    }

    // Get plant data to retrieve image URL
    const plant = await this.plantRepository.getPlantById(plantId);
    if (plant && plant.imageUrl) {
      // Delete image file from upls folder
      const imagePath = path.join(__dirname, "../../", plant.imageUrl);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
          console.log("Image deleted:", imagePath);
        } catch (error) {
          console.error("Error deleting image file:", error);
          // Don't throw error, continue with plant deletion
        }
      }
    }

    // Clear water alert for this plant
    this.clearWaterAlert(plantId);

    const success = await this.plantRepository.deletePlant(plantId);
    if (success) {
      await this.roomRepository.updatePlantCount(roomId);
    }
    return success;
  }

  async updateSunlightTimer(plantId, startTime, endTime) {
    if (!plantId) {
      throw new Error("Plant ID is required");
    }
    return this.plantRepository.updateSunlightTimer(
      plantId,
      startTime,
      endTime
    );
  }
}

module.exports = PlantService;
