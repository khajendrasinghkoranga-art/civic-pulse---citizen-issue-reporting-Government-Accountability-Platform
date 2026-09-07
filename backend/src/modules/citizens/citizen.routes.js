const express = require("express");
const router = express.Router();
const citizenController = require("./citizen.controller");
const { verifyToken, restrictTo } = require("../../middleware/auth.middleware");

// Require auth for all citizen routes
router.use(verifyToken);
// Restrict all routes in this module to CITIZEN role
router.use(restrictTo("CITIZEN"));

// Get citizen dashboard stats
// GET /api/v1/citizens/me/dashboard
router.get("/me/dashboard", citizenController.getDashboard);

// Verify identity
// POST /api/v1/citizens/me/verify
router.post("/me/verify", citizenController.verifyIdentity);

module.exports = router;
