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

  async createFlower(plantId, bloomingSeasonId, fragranceLevel = null) {
    const pool = await poolPromise;

    if (bloomingSeasonId === null || bloomingSeasonId === undefined) {
      return false;
    }

    try {
      const req = pool.request();
      req.input("plantId", sql.Int, plantId);

      // If numeric ID, use seasonID column; otherwise use bloomingSeason column
      if (!isNaN(Number(bloomingSeasonId))) {
        req.input("seasonId", sql.Int, bloomingSeasonId);
        if (fragranceLevel !== null && fragranceLevel !== undefined) {
          req.input("fragrance", sql.NVarChar, fragranceLevel);
          const result = await req.query(
            `INSERT INTO Flower (plantId, seasonID, fragranceLevel) VALUES (@plantId, @seasonId, @fragrance)`
          );
          if (result.rowsAffected[0] > 0) {
            console.log(
              `createFlower succeeded for plantId=${plantId} with seasonID=${bloomingSeasonId}, fragranceLevel=${fragranceLevel}`
            );
            return true;
          }
        } else {
          const result = await req.query(
            `INSERT INTO Flower (plantId, seasonID) VALUES (@plantId, @seasonId)`
          );
          if (result.rowsAffected[0] > 0) {
            console.log(
              `createFlower succeeded for plantId=${plantId} with seasonID=${bloomingSeasonId}`
            );
            return true;
          }
        }
      } else {
        req.input("seasonName", sql.NVarChar, bloomingSeasonId);
        if (fragranceLevel !== null && fragranceLevel !== undefined) {
          req.input("fragrance", sql.NVarChar, fragranceLevel);
          const result = await req.query(
            `INSERT INTO Flower (plantId, bloomingSeason, fragranceLevel) VALUES (@plantId, @seasonName, @fragrance)`
          );
          if (result.rowsAffected[0] > 0) {
            console.log(
              `createFlower succeeded for plantId=${plantId} with bloomingSeason=${bloomingSeasonId}, fragranceLevel=${fragranceLevel}`
            );
            return true;
          }
        } else {
          const result = await req.query(
            `INSERT INTO Flower (plantId, bloomingSeason) VALUES (@plantId, @seasonName)`
          );
          if (result.rowsAffected[0] > 0) {
            console.log(
              `createFlower succeeded for plantId=${plantId} with bloomingSeason=${bloomingSeasonId}`
            );
            return true;
          }
        }
      }
    } catch (err) {
      console.warn("createFlower failed:", err.message);
    }
    return false;
  }

  async createFruit(plantId, harvestMonthId) {
    const pool = await poolPromise;

    if (harvestMonthId === null || harvestMonthId === undefined) {
      return false;
    }

    try {
      const req = pool.request();
      req.input("plantId", sql.Int, plantId);
      req.input("monthId", sql.Int, harvestMonthId);
      const result = await req.query(
        `INSERT INTO Fruit (plantId, HarvestMonthID) VALUES (@plantId, @monthId)`
      );
      if (result.rowsAffected[0] > 0) {
        console.log(
          `createFruit succeeded for plantId=${plantId} with HarvestMonthID=${harvestMonthId}`
        );
        return true;
      }
    } catch (err) {
      console.warn("createFruit failed:", err.message);
    }
    return false;
  }

  async createDecorate(plantId, leafColorId) {
    const pool = await poolPromise;

    if (leafColorId === null || leafColorId === undefined) {
      return false;
    }

    try {
      const req = pool.request();
      req.input("plantId", sql.Int, plantId);
      req.input("colorId", sql.Int, leafColorId);
      const result = await req.query(
        `INSERT INTO Decorative (plantId, LeafColorID) VALUES (@plantId, @colorId)`
      );
      if (result.rowsAffected[0] > 0) {
        console.log(
          `createDecorate succeeded for plantId=${plantId} with LeafColorID=${leafColorId}`
        );
        return true;
      }
    } catch (err) {
      console.warn("createDecorate failed:", err.message);
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
