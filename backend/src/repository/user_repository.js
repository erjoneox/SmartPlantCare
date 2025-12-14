const { poolPromise, sql } = require("./database");
const { User } = require("../domain/models");

class UserRepository {
  async getUserByEmail(email) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query(
        `SELECT userId, name, email, password, role FROM [User] WHERE email = @email`
      );
    if (result.recordset.length === 0) return null;
    const userRow = result.recordset[0];
    return new User(
      userRow.userId,
      userRow.name,
      userRow.email,
      userRow.password,
      userRow.role
    );
  }

  async createUser(name, email, hashedPassword, role = "user") {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("name", sql.NVarChar, name)
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, hashedPassword)
      .input("role", sql.NVarChar, role)
      .query(`INSERT INTO [User] (name, email, password, role)
              OUTPUT INSERTED.userId, INSERTED.name, INSERTED.email, INSERTED.password, INSERTED.role
              VALUES (@name, @email, @password, @role)`);
    const row = result.recordset[0];
    return new User(row.userId, row.name, row.email, row.password, row.role);
  }

  async getUserById(userId) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(
        `SELECT userId, name, email, password, role FROM [User] WHERE userId = @userId`
      );
    if (result.recordset.length === 0) return null;
    const userRow = result.recordset[0];
    return new User(
      userRow.userId,
      userRow.name,
      userRow.email,
      userRow.password,
      userRow.role
    );
  }
}

module.exports = UserRepository;
