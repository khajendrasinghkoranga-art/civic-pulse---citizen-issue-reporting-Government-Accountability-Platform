const express = require("express");
const router = express.Router();
const assignmentController = require("./assignment.controller");
const { verifyToken, restrictTo } = require("../../middleware/auth.middleware");

// All assignment routes require authentication
router.use(verifyToken);

// Get my assignments (staff/admin)
// GET /api/v1/assignments/my
router.get("/my", assignmentController.getMyAssignments);

// Get all assignments with filters (admin only)
// GET /api/v1/assignments
router.get(
  "/",
  restrictTo("SUPER_ADMIN", "DEPARTMENT_ADMIN"),
  assignmentController.getAllAssignments
);

// Assign issue to department/staff (admin only)
// POST /api/v1/assignments
router.post(
  "/",
  restrictTo("SUPER_ADMIN", "DEPARTMENT_ADMIN"),
  assignmentController.assignIssue
);

// Get assignment by ID
// GET /api/v1/assignments/:id
router.get("/:id", assignmentController.getAssignmentById);

// Accept assignment (assigned staff only)
// PATCH /api/v1/assignments/:id/accept
router.patch(
  "/:id/accept",
  restrictTo("DEPARTMENT_STAFF", "DEPARTMENT_ADMIN"),
  assignmentController.acceptAssignment
);

// Complete assignment (assigned staff only)
// PATCH /api/v1/assignments/:id/complete
router.patch(
  "/:id/complete",
  restrictTo("DEPARTMENT_STAFF", "DEPARTMENT_ADMIN"),
  assignmentController.completeAssignment
);

module.exports = router;
