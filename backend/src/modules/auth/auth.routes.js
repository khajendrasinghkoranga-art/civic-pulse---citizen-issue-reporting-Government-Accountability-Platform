const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const authValidation = require("./auth.validation");

// Register a new citizen
// POST /api/v1/auth/register
router.post(
  "/register",
  authValidation.validateRegister,
  authController.register
);

// Login user
// POST /api/v1/auth/login
router.post(
  "/login",
  authValidation.validateLogin,
  authController.login
);

module.exports = router;
