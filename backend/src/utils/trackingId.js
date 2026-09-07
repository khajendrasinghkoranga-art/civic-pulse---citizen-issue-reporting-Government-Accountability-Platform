const crypto = require("crypto");
const createTrackingId = (prefix = "CP") => `${prefix}-${crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
module.exports = { createTrackingId };
