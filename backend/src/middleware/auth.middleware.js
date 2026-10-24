const jwt = require("jsonwebtoken");
const prisma = require("../config/database");
const { hasPermission, hasAnyPermission, PERMISSIONS } = require("../config/permissions");

// ============================================================
// 1. JWT Authentication – verifyToken
// ============================================================

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
      select: { id: true, name: true, email: true, role: true, organization: true, sector: true, designation: true, isActive: true, identityVerified: true },
    });

    if (!req.user) return res.status(401).json({ success: false, message: "Not authorized, user not found" });
    if (!req.user.isActive) return res.status(401).json({ success: false, message: "Not authorized, user account is disabled" });
    return next();
  } catch (_error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// ============================================================
// 2. Role-based authorization – restrictTo
// ============================================================
// Usage: restrictTo("SUPER_ADMIN", "DEPARTMENT_ADMIN")

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};

// ============================================================
// 3. Permission-based authorization – requirePermission
// ============================================================
// Usage: requirePermission(PERMISSIONS.ISSUE_CREATE)

const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const allowed = permissions.length === 1
      ? hasPermission(req.user.role, permissions[0])
      : hasAnyPermission(req.user.role, permissions);

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};

// ============================================================
// 4. Require ALL listed permissions
// ============================================================
// Usage: requireAllPermissions(PERMISSIONS.ISSUE_VIEW_ALL, PERMISSIONS.ISSUE_UPDATE_STATUS)

const requireAllPermissions = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const missing = permissions.filter((p) => !hasPermission(req.user.role, p));
    if (missing.length > 0) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};

// ============================================================
// 5. Resource ownership check – requireOwnership
// ============================================================
// Generic middleware factory that fetches a resource and checks
// if the requesting user owns it (or is an admin).
//
// Usage:
//   requireOwnership({
//     model: "issue",
//     idParam: "id",                // req.params key
//     ownerField: "reporterId",     // column that holds owner user ID
//     adminRoles: ["SUPER_ADMIN"],  // roles that bypass ownership check
//   })

const requireOwnership = ({ model, idParam = "id", ownerField = "userId", adminRoles = ["SUPER_ADMIN", "DEPARTMENT_ADMIN"] }) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    // Admin bypass
    if (adminRoles.includes(req.user.role)) {
      return next();
    }

    const resourceId = req.params[idParam];
    if (!resourceId) {
      return res.status(400).json({ success: false, message: `Missing parameter: ${idParam}` });
    }

    try {
      const resource = await prisma[model].findUnique({
        where: { id: resourceId },
        select: { [ownerField]: true },
      });

      if (!resource) {
        return res.status(404).json({ success: false, message: `${model.charAt(0).toUpperCase() + model.slice(1)} not found` });
      }

      if (resource[ownerField] !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to access this resource",
        });
      }

      // Attach fetched resource to req for downstream handlers
      req.resource = resource;
      next();
    } catch (error) {
      console.error(`Ownership check error [${model}]:`, error);
      return res.status(500).json({ success: false, message: "Authorization check failed" });
    }
  };
};

// ============================================================
// 6. Require verified identity – requireVerifiedIdentity
// ============================================================
// Some actions (e.g. voting) should only be available to users
// whose identities have been verified.

const requireVerifiedIdentity = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  if (!req.user.identityVerified) {
    return res.status(403).json({
      success: false,
      message: "Identity verification required to perform this action",
    });
  }
  next();
};

// ============================================================
// 7. Combine multiple authorization checks (AND logic)
// ============================================================
// Usage: composeAuth(verifyToken, requirePermission(PERMISSIONS.ISSUE_CREATE), requireVerifiedIdentity)

const composeAuth = (...middlewares) => {
  return (req, res, next) => {
    const run = (index) => {
      if (index >= middlewares.length) return next();
      middlewares[index](req, res, (err) => {
        if (err) return next(err);
        run(index + 1);
      });
    };
    run(0);
  };
};

module.exports = {
  verifyToken,
  restrictTo,
  requirePermission,
  requireAllPermissions,
  requireOwnership,
  requireVerifiedIdentity,
  composeAuth,
  PERMISSIONS,
};
