const issueRepository = require("./issue.repository");

/**
 * Create a new civic issue
 * Looks up the category to auto-set priority and SLA hours
 */
const createIssue = async (data, reporterId) => {
    // Validate that the category exists
    const category = await issueRepository.getCategoryById(data.categoryId);
    if (!category) {
        throw new Error("Invalid category ID");
    }

    return await issueRepository.createIssue(
        { ...data, reporterId },
        category
    );
};

/**
 * Get all reported issues with filters and pagination
 */
const getAllIssues = async (filters) => {
    return await issueRepository.getAllIssues(filters);
};

/**
 * Get issues reported by a specific citizen
 */
const getMyIssues = async (reporterId, pagination) => {
    return await issueRepository.getIssuesByReporter(reporterId, pagination);
};

/**
 * Get a single issue by ID with full details
 */
const getIssueById = async (id) => {
    const issue = await issueRepository.getIssueById(id);
    if (!issue) {
        throw new Error("Issue not found");
    }
    return issue;
};

/**
 * Get the status history for a specific issue
 */
const getIssueHistory = async (issueId) => {
    // Verify the issue exists first
    const issue = await issueRepository.getIssueById(issueId);
    if (!issue) {
        throw new Error("Issue not found");
    }
    return await issueRepository.getIssueHistory(issueId);
};

/**
 * Update issue status with audit trail
 */
const updateIssueStatus = async (issueId, newStatus, changedBy, remarks) => {
    const updatedIssue = await issueRepository.updateIssueStatus(
        issueId,
        newStatus,
        changedBy,
        remarks
    );
    if (!updatedIssue) {
        throw new Error("Issue not found");
    }
    return updatedIssue;
};

/**
 * Get all available issue categories
 */
const getAllCategories = async () => {
    return await issueRepository.getAllCategories();
};

module.exports = {
    createIssue,
    getAllIssues,
    getMyIssues,
    getIssueById,
    getIssueHistory,
    updateIssueStatus,
    getAllCategories,
};