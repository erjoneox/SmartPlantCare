const UserRepository = require("../../repository/user_repository");
const AuthService = require("../../service/auth_service");

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);

class AuthController {
  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const user = await authService.register(name, email, password, role);
      res.status(201).json({
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Missing email or password" });
      }

      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();
