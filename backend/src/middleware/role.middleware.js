// Keep the persisted Prisma roles intact while accepting common API aliases.
const roleAliases = {
  OFFICIAL: "DEPARTMENT_STAFF",
  ADMIN: "DEPARTMENT_ADMIN",
};

const normalizeRoles = (roles) => roles.map((role) => roleAliases[role] || role);

const authorize = (...roles) => {
  const allowedRoles = normalizeRoles(roles);
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "You do not have permission to perform this action" });
    }
    next();
  };
};

const requireRoles = (...roles) => authorize(...roles);

module.exports = { authorize, requireRoles };
