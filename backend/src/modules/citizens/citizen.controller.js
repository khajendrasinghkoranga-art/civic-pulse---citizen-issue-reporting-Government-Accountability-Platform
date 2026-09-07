const citizenService = require("./citizen.service");

/**
 * GET /api/v1/citizens/me/dashboard
 * Citizen: Get dashboard summary
 */
const getDashboard = async (req, res) => {
  try {
    const stats = await citizenService.getDashboardStats(req.user.id);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Citizen dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};

/**
 * POST /api/v1/citizens/me/verify
 * Citizen: Submit identity for verification
 */
const verifyIdentity = async (req, res) => {
  try {
    const { documentNumber } = req.body;
    
    const result = await citizenService.submitIdentityProof(
      req.user.id, 
      documentNumber
    );

    res.json({
      success: true,
      message: "Identity verified successfully",
      data: result,
    });
  } catch (error) {
    console.error("Identity verification error:", error);
    
    if (error.message.includes("required")) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: "Failed to verify identity",
    });
  }
};

module.exports = {
  getDashboard,
  verifyIdentity,
};
