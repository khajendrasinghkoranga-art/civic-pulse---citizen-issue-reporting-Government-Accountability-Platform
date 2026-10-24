const express = require("express");
const controller = require("./analytics.controller");
const {
  verifyToken,
  requirePermission,
  PERMISSIONS,
} = require("../../middleware/auth.middleware");
const router = express.Router();

router.use(verifyToken, requirePermission(PERMISSIONS.ANALYTICS_VIEW));
router.get("/overview", controller.getOverview);
router.get("/categories", controller.getCategoryPerformance);

module.exports = router;
