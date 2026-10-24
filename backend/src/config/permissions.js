// ============================================================
// Centralized Permission Definitions for CivicPulse
// ============================================================
// Each role maps to an array of permission strings.
// Middleware can check `req.user.role` against this map to
// decide whether a request is allowed.
// ============================================================

const PERMISSIONS = {
  // ── Issue Management ──
  ISSUE_CREATE: "issue:create",
  ISSUE_VIEW_OWN: "issue:view:own",
  ISSUE_VIEW_ALL: "issue:view:all",
  ISSUE_UPDATE_STATUS: "issue:update:status",
  ISSUE_DELETE: "issue:delete",

  // ── Evidence / Uploads ──
  EVIDENCE_UPLOAD: "evidence:upload",
  EVIDENCE_VIEW: "evidence:view",

  // ── Assignments ──
  ASSIGNMENT_CREATE: "assignment:create",
  ASSIGNMENT_VIEW_OWN: "assignment:view:own",
  ASSIGNMENT_VIEW_ALL: "assignment:view:all",
  ASSIGNMENT_ACCEPT: "assignment:accept",
  ASSIGNMENT_COMPLETE: "assignment:complete",

  // ── Departments ──
  DEPARTMENT_VIEW: "department:view",
  DEPARTMENT_CREATE: "department:create",
  DEPARTMENT_UPDATE: "department:update",
  DEPARTMENT_MANAGE_STAFF: "department:manage:staff",

  // ── Users ──
  USER_VIEW_OWN: "user:view:own",
  USER_VIEW_ALL: "user:view:all",
  USER_UPDATE_OWN: "user:update:own",
  USER_UPDATE_ROLE: "user:update:role",
  USER_TOGGLE_STATUS: "user:toggle:status",

  // ── Community ──
  COMMUNITY_POST_CREATE: "community:post:create",
  COMMUNITY_POST_VIEW: "community:post:view",
  COMMUNITY_POST_DELETE_OWN: "community:post:delete:own",
  COMMUNITY_POST_DELETE_ANY: "community:post:delete:any",
  COMMUNITY_COMMENT_CREATE: "community:comment:create",
  COMMUNITY_COMMENT_UPDATE_OWN: "community:comment:update:own",
  COMMUNITY_COMMENT_DELETE_OWN: "community:comment:delete:own",
  COMMUNITY_COMMENT_DELETE_ANY: "community:comment:delete:any",

  // ── Polls / Elections ──
  POLL_CREATE: "poll:create",
  POLL_UPDATE_STATUS: "poll:update:status",
  POLL_VIEW: "poll:view",
  POLL_VOTE: "poll:vote",

  // ── Notifications ──
  NOTIFICATION_VIEW_OWN: "notification:view:own",
  NOTIFICATION_MARK_READ: "notification:mark:read",

  // ── Feedback ──
  FEEDBACK_SUBMIT: "feedback:submit",
  FEEDBACK_VIEW: "feedback:view",

  // ── Analytics ──
  ANALYTICS_VIEW: "analytics:view",

  // ── Admin ──
  ADMIN_DASHBOARD: "admin:dashboard",
};

// ── Role → Permission mapping ──
const ROLE_PERMISSIONS = {
  CITIZEN: [
    PERMISSIONS.ISSUE_CREATE,
    PERMISSIONS.ISSUE_VIEW_OWN,
    PERMISSIONS.ISSUE_VIEW_ALL,
    PERMISSIONS.EVIDENCE_UPLOAD,
    PERMISSIONS.EVIDENCE_VIEW,
    PERMISSIONS.USER_VIEW_OWN,
    PERMISSIONS.USER_UPDATE_OWN,
    PERMISSIONS.COMMUNITY_POST_CREATE,
    PERMISSIONS.COMMUNITY_POST_VIEW,
    PERMISSIONS.COMMUNITY_POST_DELETE_OWN,
    PERMISSIONS.COMMUNITY_COMMENT_CREATE,
    PERMISSIONS.COMMUNITY_COMMENT_UPDATE_OWN,
    PERMISSIONS.COMMUNITY_COMMENT_DELETE_OWN,
    PERMISSIONS.POLL_VIEW,
    PERMISSIONS.POLL_VOTE,
    PERMISSIONS.NOTIFICATION_VIEW_OWN,
    PERMISSIONS.NOTIFICATION_MARK_READ,
    PERMISSIONS.FEEDBACK_SUBMIT,
    PERMISSIONS.DEPARTMENT_VIEW,
  ],

  DEPARTMENT_STAFF: [
    PERMISSIONS.ISSUE_VIEW_ALL,
    PERMISSIONS.ISSUE_UPDATE_STATUS,
    PERMISSIONS.EVIDENCE_VIEW,
    PERMISSIONS.ASSIGNMENT_VIEW_OWN,
    PERMISSIONS.ASSIGNMENT_ACCEPT,
    PERMISSIONS.ASSIGNMENT_COMPLETE,
    PERMISSIONS.USER_VIEW_OWN,
    PERMISSIONS.USER_UPDATE_OWN,
    PERMISSIONS.COMMUNITY_POST_CREATE,
    PERMISSIONS.COMMUNITY_POST_VIEW,
    PERMISSIONS.COMMUNITY_POST_DELETE_OWN,
    PERMISSIONS.COMMUNITY_COMMENT_CREATE,
    PERMISSIONS.COMMUNITY_COMMENT_UPDATE_OWN,
    PERMISSIONS.COMMUNITY_COMMENT_DELETE_OWN,
    PERMISSIONS.POLL_VIEW,
    PERMISSIONS.POLL_VOTE,
    PERMISSIONS.NOTIFICATION_VIEW_OWN,
    PERMISSIONS.NOTIFICATION_MARK_READ,
    PERMISSIONS.FEEDBACK_VIEW,
    PERMISSIONS.DEPARTMENT_VIEW,
  ],

  DEPARTMENT_ADMIN: [
    PERMISSIONS.ISSUE_VIEW_ALL,
    PERMISSIONS.ISSUE_UPDATE_STATUS,
    PERMISSIONS.EVIDENCE_VIEW,
    PERMISSIONS.ASSIGNMENT_CREATE,
    PERMISSIONS.ASSIGNMENT_VIEW_ALL,
    PERMISSIONS.ASSIGNMENT_ACCEPT,
    PERMISSIONS.ASSIGNMENT_COMPLETE,
    PERMISSIONS.DEPARTMENT_VIEW,
    PERMISSIONS.DEPARTMENT_MANAGE_STAFF,
    PERMISSIONS.USER_VIEW_OWN,
    PERMISSIONS.USER_VIEW_ALL,
    PERMISSIONS.USER_UPDATE_OWN,
    PERMISSIONS.COMMUNITY_POST_CREATE,
    PERMISSIONS.COMMUNITY_POST_VIEW,
    PERMISSIONS.COMMUNITY_POST_DELETE_ANY,
    PERMISSIONS.COMMUNITY_COMMENT_CREATE,
    PERMISSIONS.COMMUNITY_COMMENT_UPDATE_OWN,
    PERMISSIONS.COMMUNITY_COMMENT_DELETE_ANY,
    PERMISSIONS.POLL_CREATE,
    PERMISSIONS.POLL_UPDATE_STATUS,
    PERMISSIONS.POLL_VIEW,
    PERMISSIONS.POLL_VOTE,
    PERMISSIONS.NOTIFICATION_VIEW_OWN,
    PERMISSIONS.NOTIFICATION_MARK_READ,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ADMIN_DASHBOARD,
  ],

  SUPER_ADMIN: Object.values(PERMISSIONS), // full access
};

/**
 * Check whether a role has a specific permission.
 * @param {string} role  – Prisma Role enum value
 * @param {string} permission – permission string from PERMISSIONS
 * @returns {boolean}
 */
const hasPermission = (role, permission) => {
  const perms = ROLE_PERMISSIONS[role];
  return perms ? perms.includes(permission) : false;
};

/**
 * Check whether a role has ALL of the listed permissions.
 */
const hasAllPermissions = (role, permissions) =>
  permissions.every((p) => hasPermission(role, p));

/**
 * Check whether a role has ANY of the listed permissions.
 */
const hasAnyPermission = (role, permissions) =>
  permissions.some((p) => hasPermission(role, p));

module.exports = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
};
