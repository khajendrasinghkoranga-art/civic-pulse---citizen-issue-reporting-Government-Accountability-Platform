const adminService = require("./admin.service");
const getDashboard = async (_req, res) => {
  try { res.json({ success: true, data: await adminService.getDashboard() }); }
  catch (error) { console.error("Admin dashboard error:", error); res.status(500).json({ success: false, message: "Failed to fetch admin dashboard" }); }
};
module.exports = { getDashboard };
