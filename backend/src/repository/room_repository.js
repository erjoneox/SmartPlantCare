const { poolPromise, sql } = require("./database");

class RoomRepository {
  async createRoom(userId, name, comment) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("name", sql.NVarChar, name)
      .input("comment", sql.NVarChar, comment || null).query(`
        INSERT INTO Room (userId, name, comment, numberOfPlants)
        OUTPUT INSERTED.roomId, INSERTED.userId, INSERTED.name, INSERTED.comment, INSERTED.numberOfPlants, INSERTED.createdAt
        VALUES (@userId, @name, @comment, 0)
      `);
    return result.recordset[0];
  }

  async getRoomsByUserId(userId) {
    const pool = await poolPromise;
    const result = await pool.request().input("userId", sql.Int, userId).query(`
        SELECT roomId, userId, name, comment, numberOfPlants, createdAt
        FROM Room
        WHERE userId = @userId
        ORDER BY createdAt DESC
      `);
    return result.recordset;
  }

  async getRoomById(roomId, userId) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("roomId", sql.Int, roomId)
      .input("userId", sql.Int, userId).query(`
        SELECT roomId, userId, name, comment, numberOfPlants, createdAt
        FROM Room
        WHERE roomId = @roomId AND userId = @userId
      `);
    return result.recordset[0];
  }

  async updateRoom(roomId, userId, name, comment) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("roomId", sql.Int, roomId)
      .input("userId", sql.Int, userId)
      .input("name", sql.NVarChar, name)
      .input("comment", sql.NVarChar, comment || null).query(`
        UPDATE Room
        SET name = @name, comment = @comment
        WHERE roomId = @roomId AND userId = @userId
      `);
    return result.rowsAffected[0] > 0;
  }

  async deleteRoom(roomId, userId) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("roomId", sql.Int, roomId)
      .input("userId", sql.Int, userId).query(`
        DELETE FROM Room
        WHERE roomId = @roomId AND userId = @userId
      `);
    return result.rowsAffected[0] > 0;
  }

  async updatePlantCount(roomId) {
    const pool = await poolPromise;
    await pool.request().input("roomId", sql.Int, roomId).query(`
        UPDATE Room
        SET numberOfPlants = (SELECT COUNT(*) FROM Plant WHERE roomId = @roomId)
        WHERE roomId = @roomId
      `);
  }
}

module.exports = RoomRepository;
