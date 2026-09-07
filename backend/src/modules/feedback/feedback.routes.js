const express = require("express");
const controller = require("./feedback.controller");
const { verifyToken } = require("../../middleware/auth.middleware");
const router = express.Router();
router.use(verifyToken);
router.post("/issues/:issueId", controller.submitFeedback);
router.get("/issues/:issueId", controller.getFeedback);
module.exports = router;
