const express = require("express");
const controller = require("./upload.controller");
const {
  verifyToken,
  requirePermission,
  requireOwnership,
  PERMISSIONS,
} = require("../../middleware/auth.middleware");
const router = express.Router();

router.use(verifyToken);

// Upload evidence for an issue (owner of the issue or admin)
// POST /api/v1/uploads/issues/:issueId/evidence
router.post(
  "/issues/:issueId/evidence",
  requirePermission(PERMISSIONS.EVIDENCE_UPLOAD),
  requireOwnership({
    model: "issue",
    idParam: "issueId",
    ownerField: "reporterId",
    adminRoles: ["SUPER_ADMIN", "DEPARTMENT_ADMIN"],
  }),
  controller.uploadIssueEvidence
);

module.exports = router;
