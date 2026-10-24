const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const authValidation = require("./auth.validation");
const { verifyToken } = require("../../middleware/auth.middleware");
const { createRateLimit } = require("../../middleware/rateLimit.middleware");
const loginRateLimit = createRateLimit({ windowMs: 15 * 60_000, max: 10 });

// ── Public routes (no auth needed) ──

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
  loginRateLimit,
  authValidation.validateLogin,
  authController.login
);

// Get list of official sector magistrates from the database
// GET /api/v1/auth/magistrates
router.get("/magistrates", authController.getSectorMagistrates);

// Google Sign-In / Register
// POST /api/v1/auth/google
router.post(
  "/google",
  authController.googleAuth
);

// Refresh access token (uses refresh token, no JWT needed)
// POST /api/v1/auth/refresh-token
router.post(
  "/refresh-token",
  authValidation.validateRefreshToken,
  authController.refreshToken
);

// ── Authenticated routes ──

// Logout (revokes the provided refresh token)
// POST /api/v1/auth/logout
router.post(
  "/logout",
  verifyToken,
  authValidation.validateLogout,
  authController.logout
);

// Logout from all sessions (revokes all refresh tokens)
// POST /api/v1/auth/logout-all
router.post(
  "/logout-all",
  verifyToken,
  authController.logoutAll
);

// Change password (requires current password)
// POST /api/v1/auth/change-password
router.post(
  "/change-password",
  verifyToken,
  authValidation.validateChangePassword,
  authController.changePassword
);

// Get currently authenticated user
// GET /api/v1/auth/me
router.get(
  "/me",
  verifyToken,
  authController.me
);

module.exports = router;
