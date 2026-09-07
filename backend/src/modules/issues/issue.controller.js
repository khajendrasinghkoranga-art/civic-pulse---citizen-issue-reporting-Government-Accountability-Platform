const issueService = require("./issue.service");

/**
 * POST /api/v1/issues
 * Create a new civic issue (reporterId comes from JWT)
 */
const createIssue = async (req, res) => {
    try {
        const issue = await issueService.createIssue(req.body, req.user.id);

        res.status(201).json({
            success: true,
            message: "Issue reported successfully",
            data: issue,
        });
    } catch (error) {
        console.error("Create issue error:", error);

        if (error.message === "Invalid category ID") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create issue",
        });
    }
};

/**
 * GET /api/v1/issues
 * Get all issues with filters and pagination
 */
const getAllIssues = async (req, res) => {
    try {
        const { status, priority, categoryId, city, locality, search, page, limit } = req.query;

        const result = await issueService.getAllIssues({
            status,
            priority,
            categoryId,
            city,
            locality,
            search,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        });

        res.json({
            success: true,
            data: result.issues,
            pagination: result.pagination,
        });
    } catch (error) {
        console.error("Get issues error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch issues",
        });
    }
};

/**
 * GET /api/v1/issues/my
 * Get issues reported by the logged-in citizen
 */
const getMyIssues = async (req, res) => {
    try {
        const { page, limit } = req.query;

        const result = await issueService.getMyIssues(req.user.id, {
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        });

        res.json({
            success: true,
            data: result.issues,
            pagination: result.pagination,
        });
    } catch (error) {
        console.error("Get my issues error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch your issues",
        });
    }
};

/**
 * GET /api/v1/issues/categories
 * Get all available issue categories
 */
const getCategories = async (req, res) => {
    try {
        const categories = await issueService.getAllCategories();

        res.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        console.error("Get categories error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch categories",
        });
    }
};

/**
 * GET /api/v1/issues/:id
 * Get single issue by ID with full details
 */
const getIssueById = async (req, res) => {
    try {
        const issue = await issueService.getIssueById(req.params.id);

        res.json({
            success: true,
            data: issue,
        });
    } catch (error) {
        console.error("Get issue error:", error);

        if (error.message === "Issue not found") {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to fetch issue",
        });
    }
};

/**
 * GET /api/v1/issues/:id/history
 * Get status history for a specific issue
 */
const getIssueHistory = async (req, res) => {
    try {
        const history = await issueService.getIssueHistory(req.params.id);

        res.json({
            success: true,
            data: history,
        });
    } catch (error) {
        console.error("Get issue history error:", error);

        if (error.message === "Issue not found") {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to fetch issue history",
        });
    }
};

/**
 * PATCH /api/v1/issues/:id/status
 * Update issue status (staff/admin only, changedBy from JWT)
 */
const updateIssueStatus = async (req, res) => {
    try {
        const { status, remarks } = req.body;

        const issue = await issueService.updateIssueStatus(
            req.params.id,
            status,
            req.user.id,
            remarks
        );

        res.json({
            success: true,
            message: `Issue status updated to ${status}`,
            data: issue,
        });
    } catch (error) {
        console.error("Update status error:", error);

        if (error.message === "Issue not found") {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update issue status",
        });
    }
};

module.exports = {
    createIssue,
    getAllIssues,
    getMyIssues,
    getCategories,
    getIssueById,
    getIssueHistory,
    updateIssueStatus,
};
