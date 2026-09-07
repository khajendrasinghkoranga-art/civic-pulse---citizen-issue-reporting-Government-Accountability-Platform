const prisma = require("../../config/database");

const issueListInclude = {
    reporter: {
        select: {
            id: true,
            name: true,
            email: true,
        },
    },
    category: {
        select: {
            id: true,
            name: true,
            icon: true,
        },
    },
    evidence: {
        select: {
            id: true,
            fileUrl: true,
            fileType: true,
        },
    },
    sla: {
        select: {
            dueAt: true,
            isBreached: true,
        },
    },
    _count: {
        select: {
            comments: true,
        },
    },
};

/**
 * Create a new civic issue and auto-generate SLA record
 */
const createIssue = async (data, category) => {
    // Determine priority: use provided or fall back to category default
    const priority = data.priority || category.defaultPriority || "MEDIUM";
    const slaHours = category.defaultSlaHours || 48;
    const dueAt = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    return await prisma.issue.create({
        data: {
            ...data,
            priority,
            slaDueAt: dueAt,
            // Auto-create the SLA record
            sla: {
                create: {
                    priority,
                    targetHours: slaHours,
                    dueAt,
                },
            },
        },
        include: {
            reporter: {
                select: { id: true, name: true, email: true },
            },
            category: {
                select: { id: true, name: true, icon: true },
            },
            sla: {
                select: { dueAt: true, targetHours: true },
            },
        },
    });
};

/**
 * Get all reported issues with filters and pagination
 */
const getAllIssues = async ({ status, priority, categoryId, city, locality, search, page = 1, limit = 20 }) => {
    const where = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (categoryId) where.categoryId = categoryId;
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (locality) where.locality = { contains: locality, mode: "insensitive" };
    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
        ];
    }

    const skip = (page - 1) * limit;

    const [issues, total] = await Promise.all([
        prisma.issue.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: issueListInclude,
            skip,
            take: limit,
        }),
        prisma.issue.count({ where }),
    ]);

    return {
        issues,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get issues reported by a specific citizen
 */
const getIssuesByReporter = async (reporterId, { page = 1, limit = 20 }) => {
    const where = { reporterId };
    const skip = (page - 1) * limit;

    const [issues, total] = await Promise.all([
        prisma.issue.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: issueListInclude,
            skip,
            take: limit,
        }),
        prisma.issue.count({ where }),
    ]);

    return {
        issues,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
};

/**
 * Get a single issue by ID with full details
 */
const getIssueById = async (id) => {
    return await prisma.issue.findUnique({
        where: { id },
        include: {
            reporter: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            category: true,
            evidence: true,
            statusHistory: {
                orderBy: { changedAt: "asc" },
                include: {
                    changer: {
                        select: {
                            id: true,
                            name: true,
                            role: true,
                        },
                    },
                },
            },
            assignments: {
                include: {
                    department: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    assignee: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            comments: {
                orderBy: { createdAt: "asc" },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            role: true,
                        },
                    },
                },
            },
            sla: true,
            feedback: true,
        },
    });
};

/**
 * Get the status history for a specific issue
 */
const getIssueHistory = async (issueId) => {
    return await prisma.issueStatusHistory.findMany({
        where: { issueId },
        orderBy: { changedAt: "asc" },
        include: {
            changer: {
                select: { id: true, name: true, role: true },
            },
        },
    });
};

/**
 * Update issue status and create status history entry (transaction)
 */
const updateIssueStatus = async (issueId, newStatus, changedBy, remarks) => {
    // Get current issue status
    const currentIssue = await prisma.issue.findUnique({
        where: { id: issueId },
        select: { status: true },
    });

    if (!currentIssue) return null;

    // Use transaction to update status + create history atomically
    const [updatedIssue, _statusHistory] = await prisma.$transaction([
        prisma.issue.update({
            where: { id: issueId },
            data: {
                status: newStatus,
                ...(newStatus === "RESOLVED" && { resolvedAt: new Date() }),
            },
            include: {
                category: {
                    select: { id: true, name: true, icon: true },
                },
            },
        }),
        prisma.issueStatusHistory.create({
            data: {
                issueId,
                oldStatus: currentIssue.status,
                newStatus,
                changedBy,
                remarks,
            },
        }),
    ]);

    return updatedIssue;
};

/**
 * Look up a category by ID
 */
const getCategoryById = async (categoryId) => {
    return await prisma.issueCategory.findUnique({
        where: { id: categoryId },
    });
};

/**
 * Get all issue categories
 */
const getAllCategories = async () => {
    return await prisma.issueCategory.findMany({
        orderBy: { name: "asc" },
    });
};

module.exports = {
    createIssue,
    getAllIssues,
    getIssuesByReporter,
    getIssueById,
    getIssueHistory,
    updateIssueStatus,
    getCategoryById,
    getAllCategories,
};
