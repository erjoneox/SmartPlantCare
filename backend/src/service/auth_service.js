const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async register(name, email, password, role = "user") {
    const existingUser = await this.userRepository.getUserByEmail(email);
    if (existingUser) throw new Error("User already exists");
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.userRepository.createUser(name, email, hashedPassword, role);
  }

  async login(email, password) {
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) throw new Error("Invalid email or password");
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) throw new Error("Invalid email or password");
    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return { token, user };
  }
}

module.exports = AuthService;
