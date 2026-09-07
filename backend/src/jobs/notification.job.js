const prisma = require("../config/database");
const { createNotification } = require("../modules/notifications/notification.service");

/** Create SLA warnings for issues due within the requested time window. */
const runSlaWarningCheck = async (warningHours = 6) => {
  const now = new Date();
  const deadline = new Date(now.getTime() + warningHours * 60 * 60 * 1000);
  const dueSoon = await prisma.issueSLA.findMany({
    where: { dueAt: { gt: now, lte: deadline }, isBreached: false, issue: { status: { notIn: ["RESOLVED", "REJECTED"] } } },
    include: { issue: { select: { id: true, title: true, reporterId: true } } },
  });
  const created = await Promise.all(dueSoon.map(async (sla) => {
    const alreadyWarned = await prisma.notification.findFirst({ where: { userId: sla.issue.reporterId, issueId: sla.issue.id, type: "SLA_WARNING", createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }, select: { id: true } });
    if (alreadyWarned) return false;
    await createNotification({ userId: sla.issue.reporterId, issueId: sla.issue.id, type: "SLA_WARNING", title: "Issue response target approaching", message: `The response target for “${sla.issue.title}” is approaching.` });
    return true;
  }));
  return { warned: created.filter(Boolean).length };
};

module.exports = { runSlaWarningCheck };
