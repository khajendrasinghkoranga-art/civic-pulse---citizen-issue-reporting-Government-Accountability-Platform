const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const { verifyToken, restrictTo } = require("../../middleware/auth.middleware");

// All user routes require authentication
router.use(verifyToken);

// ── Self-service routes (any authenticated user) ──

// Get own profile
// GET /api/v1/users/me
router.get("/me", userController.getMyProfile);

// Update own profile (name, phone)
// PATCH /api/v1/users/me
router.patch("/me", userController.updateMyProfile);

// ── Admin-only routes ──

// Get all users (with filters: ?role=CITIZEN&isActive=true&search=ananya&page=1&limit=20)
// GET /api/v1/users
router.get(
  "/",
  restrictTo("SUPER_ADMIN", "DEPARTMENT_ADMIN"),
  userController.getAllUsers
);

// Get single user by ID
// GET /api/v1/users/:id
router.get(
  "/:id",
  restrictTo("SUPER_ADMIN", "DEPARTMENT_ADMIN"),
  userController.getUserById
);

// Update user role
// PATCH /api/v1/users/:id/role
router.patch(
  "/:id/role",
  restrictTo("SUPER_ADMIN"),
  userController.updateUserRole
);

// Activate / deactivate user
// PATCH /api/v1/users/:id/status
router.patch(
  "/:id/status",
  restrictTo("SUPER_ADMIN"),
  userController.toggleUserActive
);

module.exports = router;
