const express = require("express");
const router = express.Router();
const AuthController = require("../controller/auth_controller");

router.post("/register", (req, res, next) =>
  AuthController.register(req, res, next)
);
router.post("/login", (req, res, next) => AuthController.login(req, res, next));

module.exports = router;
