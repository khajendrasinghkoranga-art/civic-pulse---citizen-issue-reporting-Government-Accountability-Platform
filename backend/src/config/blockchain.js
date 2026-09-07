const crypto = require("crypto");

const hashPayload = (payload) => crypto.createHash("sha256").update(typeof payload === "string" ? payload : JSON.stringify(payload)).digest("hex");
const isTransactionHash = (value) => /^0x[a-fA-F0-9]{64}$/.test(value || "");

module.exports = { hashPayload, isTransactionHash };
