class User {
  constructor(userId, name, email, password, role) {
    this.userId = userId;
    this.name = name;
    this.email = email;
    this.password = password; // stored hashed
    this.role = role;
  }
}

class Room {
  constructor(
    roomId,
    userId,
    name,
    comment,
    numberOfPlants = 0,
    createdAt = null
  ) {
    this.roomId = roomId;
    this.userId = userId;
    this.name = name;
    this.comment = comment;
    this.numberOfPlants = numberOfPlants;
    this.createdAt = createdAt;
  }
}

class Plant {
  constructor(
    plantId,
    roomId,
    name,
    imageUrl,
    waterFrequency,
    waterAlert,
    type,
    sunLightTimer = null,
    lastSunlightStart = null,
    lastSunlightEnd = null,
    createdAt = null
  ) {
    this.plantId = plantId;
    this.roomId = roomId;
    this.name = name;
    this.imageUrl = imageUrl;
    this.waterFrequency = waterFrequency;
    this.waterAlert = waterAlert;
    this.type = type; // "Flower", "Fruit", "Decorative"
    this.sunLightTimer = sunLightTimer;
    this.lastSunlightStart = lastSunlightStart;
    this.lastSunlightEnd = lastSunlightEnd;
    this.createdAt = createdAt;
  }
}

class Flower {
  constructor(
    flowerId,
    plantId,
    seasonID,
    bloomingSeason = null,
    fragranceLevel = null
  ) {
    this.flowerId = flowerId;
    this.plantId = plantId;
    this.seasonID = seasonID;
    this.bloomingSeason = bloomingSeason;
    this.fragranceLevel = fragranceLevel;
  }
}

class Fruit {
  constructor(fruitId, plantId, HarvestMonthID, harvestMonth = null) {
    this.fruitId = fruitId;
    this.plantId = plantId;
    this.HarvestMonthID = HarvestMonthID;
    this.harvestMonth = harvestMonth;
  }
}

class Decorative {
  constructor(decorativeId, plantId, LeafColorID, leafColor = null) {
    this.decorativeId = decorativeId;
    this.plantId = plantId;
    this.LeafColorID = LeafColorID;
    this.leafColor = leafColor;
  }
}

class BloomingSeason {
  constructor(seasonID, seasonName) {
    this.seasonID = seasonID;
    this.seasonName = seasonName;
  }
}

class HarvestMonth {
  constructor(MonthID, MonthName) {
    this.MonthID = MonthID;
    this.MonthName = MonthName;
  }
}

class LeafColor {
  constructor(ColorID, ColorName) {
    this.ColorID = ColorID;
    this.ColorName = ColorName;
  }
}

module.exports = {
  User,
  Room,
  Plant,
  Flower,
  Fruit,
  Decorative,
  BloomingSeason,
  HarvestMonth,
  LeafColor,
};
