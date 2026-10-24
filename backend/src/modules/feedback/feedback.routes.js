const express = require("express");
const controller = require("./feedback.controller");
const {
  verifyToken,
  requirePermission,
  PERMISSIONS,
} = require("../../middleware/auth.middleware");
const router = express.Router();

router.use(verifyToken);

// Submit feedback for a resolved issue (only the reporter / citizen)
// POST /api/v1/feedback/issues/:issueId
router.post(
  "/issues/:issueId",
  requirePermission(PERMISSIONS.FEEDBACK_SUBMIT),
  controller.submitFeedback
);

// Get feedback for an issue
// GET /api/v1/feedback/issues/:issueId
router.get(
  "/issues/:issueId",
  requirePermission(PERMISSIONS.FEEDBACK_VIEW),
  controller.getFeedback
);

module.exports = router;
