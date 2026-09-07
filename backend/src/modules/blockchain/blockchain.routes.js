const express = require("express");
const controller = require("./blockchain.controller");
const { verifyToken, restrictTo } = require("../../middleware/auth.middleware");
const router = express.Router();

router.use(verifyToken);
router.get("/identity", controller.getMyIdentity);
router.post("/identity", controller.registerIdentity);
router.get("/audits/:entityType/:entityId", restrictTo("SUPER_ADMIN", "DEPARTMENT_ADMIN"), controller.getAudits);

module.exports = router;
