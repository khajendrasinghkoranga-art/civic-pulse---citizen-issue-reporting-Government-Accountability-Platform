const blockchainService = require("./blockchain.service");

const registerIdentity = async (req, res) => {
  try { res.status(201).json({ success: true, data: await blockchainService.registerIdentity(req.user.id, req.body.walletAddress) }); }
  catch (error) { res.status(error.message.includes("Invalid") || error.message.includes("already") ? 400 : 500).json({ success: false, message: error.message }); }
};
const getMyIdentity = async (req, res) => {
  try { res.json({ success: true, data: await blockchainService.getIdentity(req.user.id) }); }
  catch (_) { res.status(500).json({ success: false, message: "Failed to fetch blockchain identity" }); }
};
const getAudits = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1); const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const data = await blockchainService.getAudits(req.params.entityType, req.params.entityId, { page, limit });
    res.json({ success: true, data: data.audits, pagination: data.pagination });
  } catch (_) { res.status(500).json({ success: false, message: "Failed to fetch audit records" }); }
};
module.exports = { registerIdentity, getMyIdentity, getAudits };
