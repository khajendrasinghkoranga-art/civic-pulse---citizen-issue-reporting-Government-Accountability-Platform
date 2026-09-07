const feedbackService = require("./feedback.service");
const submitFeedback = async (req, res) => {
  try { res.status(201).json({ success: true, message: "Feedback submitted", data: await feedbackService.submitFeedback(req.params.issueId, req.user.id, req.body) }); }
  catch (error) { const client = ["Issue not found", "Only the issue reporter can submit feedback", "Feedback can only be submitted for resolved issues", "Rating must be an integer from 1 to 5", "Feedback has already been submitted for this issue"]; res.status(error.message === "Issue not found" ? 404 : client.includes(error.message) ? 400 : 500).json({ success: false, message: client.includes(error.message) ? error.message : "Failed to submit feedback" }); }
};
const getFeedback = async (req, res) => {
  try { res.json({ success: true, data: await feedbackService.getFeedback(req.params.issueId) }); }
  catch (error) { res.status(error.message === "Issue not found" ? 404 : 500).json({ success: false, message: error.message === "Issue not found" ? error.message : "Failed to fetch feedback" }); }
};
module.exports = { submitFeedback, getFeedback };
