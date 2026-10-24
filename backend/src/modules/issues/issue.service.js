const issueRepository = require("./issue.repository");
const { resolveSector, DEHRADUN_SECTORS } = require("../../utils/sectorResolver");

/**
 * Create a new civic issue
 * Looks up the category to auto-set priority and SLA hours,
 * and automatically assigns to a Dehradun municipal sector to distribute load.
 */
const createIssue = async (data, reporterId) => {
    // Validate that the category exists
    const category = await issueRepository.getCategoryById(data.categoryId);
    if (!category) {
        throw new Error("Invalid category ID");
    }

    // Auto-resolve municipal sector if not explicitly provided or to verify GPS sector
    let finalSector = data.sector;
    if (!finalSector || finalSector.trim() === "") {
        const resolved = resolveSector({
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address,
            locality: data.locality,
            sectorPreference: data.sector,
        });
        finalSector = resolved.name;
    }

    return await issueRepository.createIssue(
        { ...data, sector: finalSector, reporterId },
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
 * Helper to match sector names and IDs (e.g. Sector 1, SECTOR-1, Sector 1 (Central...))
 */
const doesSectorMatch = (magistrateSector, issueSector) => {
    if (!magistrateSector || !issueSector) return false;
    const mag = magistrateSector.toLowerCase().trim();
    const iss = issueSector.toLowerCase().trim();
    if (mag === iss) return true;

    // Compare sector number if present
    const magMatch = mag.match(/sector[-\s]*(\d+)/i);
    const issMatch = iss.match(/sector[-\s]*(\d+)/i);
    if (magMatch && issMatch && magMatch[1] === issMatch[1]) {
        return true;
    }
    return mag.includes(iss) || iss.includes(mag);
};

/**
 * Update issue status with audit trail and strict Sector RBAC verification
 */
const updateIssueStatus = async (issueId, newStatus, user, remarks, resolutionData = {}) => {
    const issue = await issueRepository.getIssueById(issueId);
    if (!issue) {
        throw new Error("Issue not found");
    }

    // Strict RBAC: If user is not SUPER_ADMIN and has an assigned sector, they can ONLY update issues in their sector
    if (user.role !== "SUPER_ADMIN" && user.sector) {
        const hasJurisdiction = doesSectorMatch(user.sector, issue.sector);
        if (!hasJurisdiction) {
            throw new Error(
                `Jurisdiction Access Denied: You are the Magistrate/Official for '${user.sector}'. You are only authorized to upgrade issues assigned to your municipal sector.`
            );
        }
    }

    const updatedIssue = await issueRepository.updateIssueStatus(
        issueId,
        newStatus,
        user.id,
        remarks,
        { ...resolutionData, changerUser: user }
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

/**
 * Get real-time workload analytics and load-balancing status across all municipal sectors
 */
const getSectorWorkload = async () => {
    return await issueRepository.getSectorWorkload();
};

/**
 * Get all configured municipal sectors in Dehradun
 */
const getAllSectors = async () => {
    return DEHRADUN_SECTORS;
};

module.exports = {
    createIssue,
    getAllIssues,
    getMyIssues,
    getIssueById,
    getIssueHistory,
    updateIssueStatus,
    getAllCategories,
    getSectorWorkload,
    getAllSectors,
};