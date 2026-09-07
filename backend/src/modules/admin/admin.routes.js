const express = require("express");
const controller = require("./admin.controller");
const { verifyToken, restrictTo } = require("../../middleware/auth.middleware");
const router = express.Router();
router.use(verifyToken, restrictTo("SUPER_ADMIN", "DEPARTMENT_ADMIN"));
router.get("/dashboard", controller.getDashboard);
module.exports = router;
