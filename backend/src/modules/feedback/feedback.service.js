const prisma = require("../../config/database");
const repository = require("./feedback.repository");

const submitFeedback = async (issueId, userId, { rating, comment }) => {
  const issue = await prisma.issue.findUnique({ where: { id: issueId }, select: { reporterId: true, status: true } });
  if (!issue) throw new Error("Issue not found");
  if (issue.reporterId !== userId) throw new Error("Only the issue reporter can submit feedback");
  if (issue.status !== "RESOLVED") throw new Error("Feedback can only be submitted for resolved issues");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Rating must be an integer from 1 to 5");
  if (await repository.findByIssue(issueId)) throw new Error("Feedback has already been submitted for this issue");
  return repository.create({ issueId, userId, rating, comment: typeof comment === "string" ? comment.trim() || null : null });
};
const getFeedback = async (issueId) => {
  const issue = await prisma.issue.findUnique({ where: { id: issueId }, select: { id: true } });
  if (!issue) throw new Error("Issue not found");
  return repository.findByIssue(issueId);
};
module.exports = { submitFeedback, getFeedback };
