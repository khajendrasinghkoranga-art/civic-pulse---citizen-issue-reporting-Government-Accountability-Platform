const express = require("express");
const controller = require("./admin.controller");
const {
  verifyToken,
  requirePermission,
  PERMISSIONS,
} = require("../../middleware/auth.middleware");
const router = express.Router();

router.use(verifyToken, requirePermission(PERMISSIONS.ADMIN_DASHBOARD));
router.get("/dashboard", controller.getDashboard);

module.exports = router;
