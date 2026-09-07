const uploadService = require("./upload.service");

const uploadIssueEvidence = async (req, res) => {
  try {
    const data = await uploadService.uploadIssueEvidence(req.params.issueId, req.user.id, req.body);
    res.status(201).json({ success: true, message: "Evidence uploaded successfully", data });
  } catch (error) {
    const clientMessages = ["Issue not found", "You can only add evidence to your own issue", "Unsupported file type", "File content is required", "File content must be valid base64"];
    const status = error.message === "Issue not found" ? 404 : clientMessages.includes(error.message) || error.message.startsWith("File must") ? 400 : 500;
    res.status(status).json({ success: false, message: status === 500 ? "Failed to upload evidence" : error.message });
  }
};

module.exports = { uploadIssueEvidence };
