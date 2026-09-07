const prisma = require("../../config/database");

const getOverview = async () => {
  const [totalIssues, resolvedIssues, activeUsers, departments, statusGroups, priorityGroups, recentIssues] = await Promise.all([
    prisma.issue.count(),
    prisma.issue.count({ where: { status: "RESOLVED" } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.department.count({ where: { isActive: true } }),
    prisma.issue.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.issue.groupBy({ by: ["priority"], _count: { _all: true } }),
    prisma.issue.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, title: true, status: true, priority: true, createdAt: true, category: { select: { name: true } } } }),
  ]);
  return {
    totals: { issues: totalIssues, resolvedIssues, resolutionRate: totalIssues ? Number(((resolvedIssues / totalIssues) * 100).toFixed(2)) : 0, activeUsers, activeDepartments: departments },
    byStatus: statusGroups.map(({ status, _count }) => ({ status, count: _count._all })),
    byPriority: priorityGroups.map(({ priority, _count }) => ({ priority, count: _count._all })),
    recentIssues,
  };
};

const getCategoryPerformance = async () => {
  const categories = await prisma.issueCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { issues: true } }, issues: { where: { status: "RESOLVED" }, select: { id: true } } },
  });
  return categories.map(({ issues, _count, ...category }) => ({ ...category, totalIssues: _count.issues, resolvedIssues: issues.length }));
};

module.exports = { getOverview, getCategoryPerformance };
