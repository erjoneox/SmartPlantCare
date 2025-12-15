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

  async getPlantsToWater(userId) {
    const pool = await poolPromise;
    const result = await pool.request().input("userId", sql.Int, userId).query(`
        SELECT p.plantId, p.name, p.roomId, p.imageUrl, p.waterFrequency, p.waterAlert, r.userId
        FROM Plant p
        JOIN Room r ON p.roomId = r.roomId
        WHERE r.userId = @userId AND p.waterAlert = 1
      `);
    return result.recordset || [];
  }
  async getPlantsByRoomId(roomId) {
    const pool = await poolPromise;
    const result = await pool.request().input("roomId", sql.Int, roomId).query(`
        SELECT p.plantId, p.roomId, p.name, p.imageUrl, p.waterFrequency, p.waterAlert, p.sunLightTimer, p.lastSunlightStart, p.lastSunlightEnd, p.createdAt,
               CASE WHEN EXISTS(SELECT 1 FROM Flower f WHERE f.plantId = p.plantId) THEN 'Flower' 
                    WHEN EXISTS(SELECT 1 FROM Fruit fr WHERE fr.plantId = p.plantId) THEN 'Fruit' 
                    WHEN EXISTS(SELECT 1 FROM Decorative d WHERE d.plantId = p.plantId) THEN 'Decorative' ELSE NULL END AS type
        FROM Plant p
        WHERE p.roomId = @roomId
        ORDER BY p.createdAt DESC
      `);
    return result.recordset;
  }

  async getPlantById(plantId) {
    const pool = await poolPromise;
    const result = await pool.request().input("plantId", sql.Int, plantId)
      .query(`
        SELECT p.plantId, p.roomId, p.name, p.imageUrl, p.waterFrequency, p.waterAlert, p.sunLightTimer, p.lastSunlightStart, p.lastSunlightEnd, p.createdAt,
               CASE WHEN EXISTS(SELECT 1 FROM Flower f WHERE f.plantId = p.plantId) THEN 'Flower' 
                    WHEN EXISTS(SELECT 1 FROM Fruit fr WHERE fr.plantId = p.plantId) THEN 'Fruit' 
                    WHEN EXISTS(SELECT 1 FROM Decorative d WHERE d.plantId = p.plantId) THEN 'Decorative' ELSE NULL END AS type
        FROM Plant p
        WHERE p.plantId = @plantId
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
    const attempts = [
      // numeric season id
      {
        sql: `INSERT INTO Flower (plantId, seasonID) VALUES (@plantId, @seasonId)`,
        params: { plantId, seasonId: bloomingSeasonId },
      },
      // season name (nvarchar)
      {
        sql: `INSERT INTO Flower (plantId, bloomingSeason) VALUES (@plantId, @seasonName)`,
        params: { plantId, seasonName: bloomingSeasonId },
      },
    ];

    for (const attempt of attempts) {
      try {
        const req = pool.request();
        req.input("plantId", sql.Int, attempt.params.plantId);
        if (
          Object.prototype.hasOwnProperty.call(attempt.params, "seasonId") &&
          attempt.params.seasonId !== null
        ) {
          req.input("seasonId", sql.Int, attempt.params.seasonId);
        }
        if (
          Object.prototype.hasOwnProperty.call(attempt.params, "seasonName") &&
          attempt.params.seasonName !== null
        ) {
          req.input("seasonName", sql.NVarChar, attempt.params.seasonName);
        }
        const result = await req.query(attempt.sql);
        if (result.rowsAffected[0] > 0) return true;
      } catch (err) {
        console.warn("createFlower attempt failed:", err.message);
      }
    }
    return false;
  }

  async createFruit(plantId, harvestMonthId) {
    const pool = await poolPromise;
    const attempts = [
      // numeric harvest month id
      {
        sql: `INSERT INTO Fruit (plantId, HarvestMonthID) VALUES (@plantId, @monthId)`,
        params: { plantId, monthId: harvestMonthId },
      },
      // month name
      {
        sql: `INSERT INTO Fruit (plantId, harvestMonth) VALUES (@plantId, @monthName)`,
        params: { plantId, monthName: harvestMonthId },
      },
    ];

    for (const attempt of attempts) {
      try {
        const req = pool.request();
        req.input("plantId", sql.Int, attempt.params.plantId);
        if (
          Object.prototype.hasOwnProperty.call(attempt.params, "monthId") &&
          attempt.params.monthId !== null
        ) {
          req.input("monthId", sql.Int, attempt.params.monthId);
        }
        if (
          Object.prototype.hasOwnProperty.call(attempt.params, "monthName") &&
          attempt.params.monthName !== null
        ) {
          req.input("monthName", sql.NVarChar, attempt.params.monthName);
        }
        const result = await req.query(attempt.sql);
        if (result.rowsAffected[0] > 0) return true;
      } catch (err) {
        console.warn("createFruit attempt failed:", err.message);
      }
    }
    return false;
  }

  async createDecorate(plantId, leafColorId) {
    const pool = await poolPromise;
    const attempts = [
      {
        sql: `INSERT INTO Decorative (plantId, LeafColorID) VALUES (@plantId, @leafColorId)`,
        params: { plantId, leafColorId },
      },
      {
        sql: `INSERT INTO Decorative (plantId, leafColor) VALUES (@plantId, @leafColorName)`,
        params: { plantId, leafColorName: leafColorId },
      },
    ];

    for (const attempt of attempts) {
      try {
        const req = pool.request();
        req.input("plantId", sql.Int, attempt.params.plantId);
        if (
          Object.prototype.hasOwnProperty.call(attempt.params, "leafColorId") &&
          attempt.params.leafColorId !== null
        ) {
          req.input("leafColorId", sql.Int, attempt.params.leafColorId);
        }
        if (
          Object.prototype.hasOwnProperty.call(
            attempt.params,
            "leafColorName"
          ) &&
          attempt.params.leafColorName !== null
        ) {
          req.input(
            "leafColorName",
            sql.NVarChar,
            attempt.params.leafColorName
          );
        }
        const result = await req.query(attempt.sql);
        if (result.rowsAffected[0] > 0) return true;
      } catch (err) {
        console.warn("createDecorate attempt failed:", err.message);
      }
    }
    return false;
  }

  async deleteFlowerByPlantId(plantId) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("plantId", sql.Int, plantId)
      .query(`DELETE FROM Flower WHERE plantId = @plantId`);
    return result.rowsAffected[0] > 0;
  }

  async deleteFruitByPlantId(plantId) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("plantId", sql.Int, plantId)
      .query(`DELETE FROM Fruit WHERE plantId = @plantId`);
    return result.rowsAffected[0] > 0;
  }

  async deleteDecorativeByPlantId(plantId) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("plantId", sql.Int, plantId)
      .query(`DELETE FROM Decorative WHERE plantId = @plantId`);
    return result.rowsAffected[0] > 0;
  }

  async getFlowerByPlantId(plantId) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("plantId", sql.Int, plantId)
      .query(`SELECT TOP 1 * FROM Flower WHERE plantId = @plantId`);
    return result.recordset[0] || null;
  }

  async getFruitByPlantId(plantId) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("plantId", sql.Int, plantId)
      .query(`SELECT TOP 1 * FROM Fruit WHERE plantId = @plantId`);
    return result.recordset[0] || null;
  }

  async getDecorativeByPlantId(plantId) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("plantId", sql.Int, plantId)
      .query(`SELECT TOP 1 * FROM Decorative WHERE plantId = @plantId`);
    return result.recordset[0] || null;
  }
}

module.exports = PlantRepository;
