const prisma = require("../../config/database");
const analyticsService = require("../analytics/analytics.service");

const getDashboard = async () => {
  const [analytics, openAssignments, overdueSlas, unreadNotifications] = await Promise.all([
    analyticsService.getOverview(),
    prisma.issueAssignment.count({ where: { completedAt: null } }),
    prisma.issueSLA.count({ where: { isBreached: true } }),
    prisma.notification.count({ where: { isRead: false } }),
  ]);
  return { ...analytics, operations: { openAssignments, overdueSlas, unreadNotifications } };
};

module.exports = { getDashboard };
