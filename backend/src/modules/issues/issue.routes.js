const express = require("express");
const router = express.Router();
const issueController = require("./issue.controller");
const issueValidation = require("./issue.validation");
const assignmentController = require("../assignments/assignment.controller");
const { verifyToken, restrictTo } = require("../../middleware/auth.middleware");

// ── Public routes (no auth needed) ──

// Get all issue categories
// GET /api/v1/issues/categories
router.get("/categories", issueController.getCategories);

// ── All routes below require authentication ──
router.use(verifyToken);

// Get my reported issues (citizen)
// GET /api/v1/issues/my
router.get("/my", issueController.getMyIssues);

router.get(
    "/:issueId/assignments",
    restrictTo("DEPARTMENT_STAFF", "DEPARTMENT_ADMIN", "SUPER_ADMIN"),
    assignmentController.getAssignmentsByIssue
);

// Create issue (any authenticated user, but primarily citizens)
// POST /api/v1/issues
router.post(
    "/",
    restrictTo("CITIZEN"),
    issueValidation.validateCreateIssue,
    issueController.createIssue
);

// Get all issues (with filters and pagination)
// GET /api/v1/issues
router.get("/", issueController.getAllIssues);

// Get single issue by ID
// GET /api/v1/issues/:id
router.get("/:id", issueController.getIssueById);

// Get status history for an issue
// GET /api/v1/issues/:id/history
router.get("/:id/history", issueController.getIssueHistory);

// Update issue status (staff/admin only)
// PATCH /api/v1/issues/:id/status
router.patch(
    "/:id/status",
    restrictTo("DEPARTMENT_STAFF", "DEPARTMENT_ADMIN", "SUPER_ADMIN"),
    issueValidation.validateUpdateIssueStatus,
    issueController.updateIssueStatus
);

module.exports = router;
