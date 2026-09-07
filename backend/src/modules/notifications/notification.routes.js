const express = require("express");
const controller = require("./notification.controller");
const { verifyToken } = require("../../middleware/auth.middleware");
const router = express.Router();

router.use(verifyToken);
router.get("/", controller.listNotifications);
router.patch("/read-all", controller.markAllRead);
router.patch("/:id/read", controller.markRead);

module.exports = router;
