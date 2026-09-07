const express = require("express");
const router = express.Router();
const departmentController = require("./department.controller");
const { verifyToken, restrictTo } = require("../../middleware/auth.middleware");

// ── Public routes ──

// List all departments (for dropdowns, public-facing pages)
// GET /api/v1/departments
router.get("/", departmentController.getAllDepartments);

// Get single department
// GET /api/v1/departments/:id
router.get("/:id", departmentController.getDepartmentById);

// ── Authenticated routes ──
router.use(verifyToken);

// Get staff associated with a department (admin/dept-admin)
// GET /api/v1/departments/:id/staff
router.get(
  "/:id/staff",
  restrictTo("SUPER_ADMIN", "DEPARTMENT_ADMIN"),
  departmentController.getDepartmentStaff
);

// ── Admin-only routes ──

// Create a new department
// POST /api/v1/departments
router.post(
  "/",
  restrictTo("SUPER_ADMIN"),
  departmentController.createDepartment
);

// Update a department
// PATCH /api/v1/departments/:id
router.patch(
  "/:id",
  restrictTo("SUPER_ADMIN"),
  departmentController.updateDepartment
);

// Activate/deactivate a department
// PATCH /api/v1/departments/:id/status
router.patch(
  "/:id/status",
  restrictTo("SUPER_ADMIN"),
  departmentController.toggleDepartmentActive
);

module.exports = router;
