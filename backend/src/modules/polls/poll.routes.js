const express = require("express");
const router = express.Router();
const pollController = require("./poll.controller");
const { verifyToken, restrictTo } = require("../../middleware/auth.middleware");

// All routes require authentication
router.use(verifyToken);

// ─── ADMIN ROUTES ───
// Only SUPER_ADMIN and DEPARTMENT_ADMIN can create and manage elections

router.post(
  "/",
  restrictTo("SUPER_ADMIN", "DEPARTMENT_ADMIN"),
  pollController.createElection
);

router.patch(
  "/:id/status",
  restrictTo("SUPER_ADMIN", "DEPARTMENT_ADMIN"),
  pollController.updateElectionStatus
);

// ─── PUBLIC ROUTES (For all authenticated users) ───

router.get("/", pollController.getElections);
router.get("/:id", pollController.getElectionById);
router.get("/:id/results", pollController.getElectionResults);
router.post("/:id/vote", pollController.castVote);

module.exports = router;
