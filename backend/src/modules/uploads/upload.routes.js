const express = require("express");
const controller = require("./upload.controller");
const { verifyToken } = require("../../middleware/auth.middleware");
const router = express.Router();

router.use(verifyToken);
router.post("/issues/:issueId/evidence", controller.uploadIssueEvidence);

module.exports = router;
