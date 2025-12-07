const { poolPromise, sql } = require("./database");

class PlantRepository {
  async createPlant(
    roomId,
    name,
    waterFrequency,
    waterAlert = true,
    imageUrl = null
  ) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("roomId", sql.Int, roomId)
      .input("name", sql.NVarChar, name)
      .input("waterFrequency", sql.Int, waterFrequency)
      .input("waterAlert", sql.Bit, waterAlert ? 1 : 0)
      .input("imageUrl", sql.NVarChar, imageUrl).query(`
        INSERT INTO Plant (roomId, name, waterFrequency, waterAlert, imageUrl)
        OUTPUT INSERTED.plantId, INSERTED.roomId, INSERTED.name, INSERTED.waterFrequency, INSERTED.waterAlert, INSERTED.imageUrl, INSERTED.sunLightTimer, INSERTED.lastSunlightStart, INSERTED.lastSunlightEnd, INSERTED.createdAt
        VALUES (@roomId, @name, @waterFrequency, @waterAlert, @imageUrl)
      `);
    return result.recordset[0];
  }

  async getPlantsByRoomId(roomId) {
    const pool = await poolPromise;
    const result = await pool.request().input("roomId", sql.Int, roomId).query(`
        SELECT plantId, roomId, name, imageUrl, waterFrequency, waterAlert, sunLightTimer, lastSunlightStart, lastSunlightEnd, createdAt
        FROM Plant
        WHERE roomId = @roomId
        ORDER BY createdAt DESC
      `);
    return result.recordset;
  }

  async getPlantById(plantId) {
    const pool = await poolPromise;
    const result = await pool.request().input("plantId", sql.Int, plantId)
      .query(`
        SELECT plantId, roomId, name, imageUrl, waterFrequency, waterAlert, sunLightTimer, lastSunlightStart, lastSunlightEnd, createdAt
        FROM Plant
        WHERE plantId = @plantId
      `);
    return result.recordset[0];
  }

  async updatePlant(
    plantId,
    name,
    waterFrequency,
    waterAlert,
    imageUrl = null,
    sunLightTimer = null
  ) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("plantId", sql.Int, plantId)
      .input("name", sql.NVarChar, name)
      .input("waterFrequency", sql.Int, waterFrequency)
      .input("waterAlert", sql.Bit, waterAlert ? 1 : 0)
      .input("imageUrl", sql.NVarChar, imageUrl)
      .input("sunLightTimer", sql.Int, sunLightTimer).query(`
        UPDATE Plant
        SET name = @name, waterFrequency = @waterFrequency, waterAlert = @waterAlert, imageUrl = @imageUrl, sunLightTimer = @sunLightTimer
        WHERE plantId = @plantId
      `);
    return result.rowsAffected[0] > 0;
  }

  async deletePlant(plantId) {
    const pool = await poolPromise;
    const result = await pool.request().input("plantId", sql.Int, plantId)
      .query(`
        DELETE FROM Plant
        WHERE plantId = @plantId
      `);
    return result.rowsAffected[0] > 0;
  }

  async updateSunlightTimer(plantId, startTime, endTime) {
    const pool = await poolPromise;
    await pool
      .request()
      .input("plantId", sql.Int, plantId)
      .input("startTime", sql.DateTime, startTime)
      .input("endTime", sql.DateTime, endTime).query(`
        UPDATE Plant
        SET lastSunlightStart = @startTime, lastSunlightEnd = @endTime
        WHERE plantId = @plantId
      `);
  }

  async createFlower(plantId, bloomingSeasonId, fragranceLevel) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("plantId", sql.Int, plantId)
      .input("seasonId", sql.Int, bloomingSeasonId)
      .input("fragranceLevel", sql.Int, fragranceLevel || 0).query(`
        INSERT INTO Flower (plantId, seasonId, fragranceLevel)
        VALUES (@plantId, @seasonId, @fragranceLevel)
      `);
    return result.rowsAffected[0] > 0;
  }

  async createFruit(plantId, harvestMonthId) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("plantId", sql.Int, plantId)
      .input("monthId", sql.Int, harvestMonthId).query(`
        INSERT INTO Fruit (plantId, monthId)
        VALUES (@plantId, @monthId)
      `);
    return result.rowsAffected[0] > 0;
  }

  async createDecorate(plantId, leafColorId) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("plantId", sql.Int, plantId)
      .input("leafColorId", sql.Int, leafColorId).query(`
        INSERT INTO Decorative (plantId, leafColorId)
        VALUES (@plantId, @leafColorId)
      `);
    return result.rowsAffected[0] > 0;
  }
}

module.exports = PlantRepository;
