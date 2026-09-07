const createRateLimit = ({ windowMs = 60_000, max = 100, key = (req) => req.ip } = {}) => {
  const requests = new Map();
  return (req, res, next) => {
    const now = Date.now(); const client = key(req); const entry = requests.get(client);
    const current = !entry || entry.resetAt <= now ? { count: 0, resetAt: now + windowMs } : entry;
    current.count += 1; requests.set(client, current);
    res.set("X-RateLimit-Limit", String(max)); res.set("X-RateLimit-Remaining", String(Math.max(0, max - current.count)));
    if (current.count > max) return res.status(429).json({ success: false, message: "Too many requests. Please try again later." });
    next();
  };
};

module.exports = { createRateLimit };
