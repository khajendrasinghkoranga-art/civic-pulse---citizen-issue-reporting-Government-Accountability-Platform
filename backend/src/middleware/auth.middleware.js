const jwt = require("jsonwebtoken");
const prisma = require("../config/database");

const verifyToken = async (req, res, next) => {
  const authorization = req.get("authorization");
  if (!authorization) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }

  const [scheme, token, ...extra] = authorization.trim().split(/\s+/);
  if (scheme.toLowerCase() !== "bearer" || !token || extra.length) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || typeof decoded.id !== "string") {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    req.user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, isActive: true, identityVerified: true },
    });

    if (!req.user) return res.status(401).json({ success: false, message: "Not authorized, user not found" });
    if (!req.user.isActive) return res.status(401).json({ success: false, message: "Not authorized, user account is disabled" });
    return next();
  } catch (_error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  restrictTo,
};
