const express = require("express");
const router = express.Router();
const pollController = require("./poll.controller");
const {
  verifyToken,
  requirePermission,
  requireVerifiedIdentity,
  PERMISSIONS,
} = require("../../middleware/auth.middleware");

// All routes require authentication
router.use(verifyToken);

// ─── ADMIN ROUTES ───
// Only SUPER_ADMIN and DEPARTMENT_ADMIN can create and manage elections

router.post(
  "/",
  requirePermission(PERMISSIONS.POLL_CREATE),
  pollController.createElection
);

router.patch(
  "/:id/status",
  requirePermission(PERMISSIONS.POLL_UPDATE_STATUS),
  pollController.updateElectionStatus
);

// ─── PUBLIC ROUTES (For all authenticated users) ───

router.get("/", pollController.getElections);
router.get("/:id", pollController.getElectionById);
router.get("/:id/results", pollController.getElectionResults);

// Vote requires both permission and verified identity
router.post(
  "/:id/vote",
  requirePermission(PERMISSIONS.POLL_VOTE),
  requireVerifiedIdentity,
  pollController.castVote
);

module.exports = router;
