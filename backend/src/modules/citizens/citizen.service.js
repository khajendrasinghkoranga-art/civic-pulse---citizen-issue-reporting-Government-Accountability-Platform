const crypto = require("crypto");
const citizenRepository = require("./citizen.repository");

/**
 * Get citizen dashboard statistics
 */
const getDashboardStats = async (userId) => {
  return await citizenRepository.getCitizenDashboardStats(userId);
};

/**
 * Process identity verification without storing raw PII
 */
const submitIdentityProof = async (userId, idDocumentNumber) => {
  if (!idDocumentNumber || idDocumentNumber.trim() === "") {
    throw new Error("Identity document number is required for verification");
  }

  // In a real application, you would call an external API (like Aadhaar eKYC) here.
  // We NEVER store the raw Aadhaar number. We only store a hash to prevent multiple 
  // accounts from using the same identity while preserving privacy.
  
  const identityProofHash = crypto
    .createHash("sha256")
    .update(idDocumentNumber + process.env.JWT_SECRET) // Salting with app secret
    .digest("hex");

  return await citizenRepository.verifyCitizenIdentity(userId, identityProofHash);
};

module.exports = {
  getDashboardStats,
  submitIdentityProof,
};
