const prisma = require("../config/database");

/** Remove read notifications older than the configured retention period. */
const purgeOldNotifications = async (retentionDays = 90) => {
  const safeDays = Math.max(1, Number(retentionDays) || 90);
  const cutoff = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000);
  const result = await prisma.notification.deleteMany({ where: { isRead: true, readAt: { lt: cutoff } } });
  return { deleted: result.count, cutoff };
};

module.exports = { purgeOldNotifications };
