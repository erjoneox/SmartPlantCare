class User {
  constructor(userId, name, email, password, role) {
    this.userId = userId;
    this.name = name;
    this.email = email;
    this.password = password; // stored hashed
    this.role = role;
  }
}
module.exports = { User };
