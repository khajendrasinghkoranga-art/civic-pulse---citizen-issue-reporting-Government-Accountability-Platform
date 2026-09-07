const prisma = require("../../config/database");
const include = { issue: { select: { id: true, title: true, status: true } }, user: { select: { id: true, name: true } } };
const findByIssue = (issueId) => prisma.issueFeedback.findUnique({ where: { issueId }, include });
const create = (data) => prisma.issueFeedback.create({ data, include });
module.exports = { findByIssue, create };
