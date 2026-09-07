const express = require("express");
const controller = require("./analytics.controller");
const { verifyToken, restrictTo } = require("../../middleware/auth.middleware");
const router = express.Router();

router.use(verifyToken, restrictTo("SUPER_ADMIN", "DEPARTMENT_ADMIN"));
router.get("/overview", controller.getOverview);
router.get("/categories", controller.getCategoryPerformance);

module.exports = router;
