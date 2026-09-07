const analyticsService = require("./analytics.service");

const getOverview = async (_req, res) => {
  try { res.json({ success: true, data: await analyticsService.getOverview() }); }
  catch (error) { console.error("Analytics overview error:", error); res.status(500).json({ success: false, message: "Failed to fetch analytics" }); }
};
const getCategoryPerformance = async (_req, res) => {
  try { res.json({ success: true, data: await analyticsService.getCategoryPerformance() }); }
  catch (error) { console.error("Category analytics error:", error); res.status(500).json({ success: false, message: "Failed to fetch category analytics" }); }
};
module.exports = { getOverview, getCategoryPerformance };
