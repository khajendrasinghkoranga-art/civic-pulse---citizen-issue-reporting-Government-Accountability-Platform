const prisma = require("../config/database");
const { createNotification } = require("../modules/notifications/notification.service");

/** Mark overdue active issues and notify their reporters once per run. */
const runSlaCheck = async () => {
  const now = new Date();
  const overdue = await prisma.issueSLA.findMany({
    where: { dueAt: { lt: now }, isBreached: false, issue: { status: { notIn: ["RESOLVED", "REJECTED"] } } },
    include: { issue: { select: { id: true, title: true, reporterId: true } } },
  });
  if (!overdue.length) return { breached: 0 };
  await prisma.$transaction(overdue.map((sla) => prisma.issueSLA.update({ where: { id: sla.id }, data: { isBreached: true, breachedAt: now } })));
  await Promise.all(overdue.map((sla) => createNotification({ userId: sla.issue.reporterId, issueId: sla.issue.id, type: "SLA_BREACHED", title: "Issue response time exceeded", message: `The response target for “${sla.issue.title}” has been exceeded.` })));
  return { breached: overdue.length };
};

module.exports = { runSlaCheck };
