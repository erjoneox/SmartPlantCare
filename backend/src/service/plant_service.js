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

    // Create type-specific records
    try {
      if (type === "Flower" && bloomingSeason) {
        await this.plantRepository.createFlower(
          plant.plantId,
          bloomingSeason,
          fragranceLevel
        );
      } else if (type === "Fruit" && harvestMonth) {
        await this.plantRepository.createFruit(plant.plantId, harvestMonth);
      } else if (type === "Decorative" && leafColor) {
        await this.plantRepository.createDecorate(plant.plantId, leafColor);
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
        // Don't fail the plant creation if alert scheduling fails
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
      const alertInterval = waterFrequency * 24 * 60 * 60;

      // Clear any existing interval for this plant
      if (this.waterAlertIntervals[plantId]) {
        clearInterval(this.waterAlertIntervals[plantId]);
      }

      // Set interval to send email every waterFrequency days
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
    return this.plantRepository.getPlantsByRoomId(roomId);
  }

  async getPlant(plantId) {
    if (!plantId) {
      throw new Error("Plant ID is required");
    }
    const plant = await this.plantRepository.getPlantById(plantId);
    if (!plant) {
      throw new Error("Plant not found");
    }
    return plant;
  }

  async updatePlant(
    plantId,
    name,
    waterFrequency,
    waterAlert,
    imageUrl = null,
    sunLightTimer = null
  ) {
    if (!plantId || !name || waterFrequency === undefined) {
      throw new Error("Plant ID, name, and water frequency are required");
    }
    const success = await this.plantRepository.updatePlant(
      plantId,
      name,
      waterFrequency,
      waterAlert,
      imageUrl,
      sunLightTimer
    );
    if (!success) {
      throw new Error("Failed to update plant");
    }
    return success;
  }

  async deletePlant(plantId, roomId) {
    if (!plantId || !roomId) {
      throw new Error("Plant ID and Room ID are required");
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
