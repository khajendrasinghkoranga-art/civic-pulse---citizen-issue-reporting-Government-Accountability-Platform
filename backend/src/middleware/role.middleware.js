// ============================================================
// Role Middleware – thin wrapper over auth.middleware
// ============================================================
// This file re-exports authorization helpers from auth.middleware
// so that existing imports (`require("../../middleware/role.middleware")`)
// continue to work without changes.
// ============================================================

const { restrictTo, requirePermission } = require("./auth.middleware");

// Keep the persisted Prisma roles intact while accepting common API aliases.
const roleAliases = {
  OFFICIAL: "DEPARTMENT_STAFF",
  ADMIN: "DEPARTMENT_ADMIN",
};

const normalizeRoles = (roles) => roles.map((role) => roleAliases[role] || role);

const authorize = (...roles) => restrictTo(...normalizeRoles(roles));

const requireRoles = (...roles) => authorize(...roles);

module.exports = { authorize, requireRoles, requirePermission };
