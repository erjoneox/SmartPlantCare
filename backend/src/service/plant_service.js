class PlantService {
  constructor(plantRepository, roomRepository) {
    this.plantRepository = plantRepository;
    this.roomRepository = roomRepository;
  }

  async addPlant(roomId, plantData) {
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

    // Optional type
    if (type === "Flower" && bloomingSeason) {
      await this.plantRepository.createFlower(plant.plantId, bloomingSeason, fragranceLevel);
    } else if (type === "Fruit" && harvestMonth) {
      await this.plantRepository.createFruit(plant.plantId, harvestMonth);
    } else if (type === "Decorative" && leafColor) {
      await this.plantRepository.createDecorate(plant.plantId, leafColor);
    }

    await this.roomRepository.updatePlantCount(roomId);

    return plant;
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
