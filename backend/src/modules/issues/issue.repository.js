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
const getAllIssues = async ({ status, priority, categoryId, sector, city, locality, search, page = 1, limit = 20 }) => {
    const where = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (categoryId) where.categoryId = categoryId;
    if (sector && sector.toUpperCase() !== "ALL") {
        const sectorNormalized = sector.replace(/-/g, " ");
        where.sector = {
            contains: sectorNormalized.length < sector.length ? sectorNormalized : sector,
            mode: "insensitive",
        };
    }
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (locality) where.locality = { contains: locality, mode: "insensitive" };
    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { sector: { contains: search, mode: "insensitive" } },
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
const updateIssueStatus = async (issueId, newStatus, changedBy, remarks, resolutionData = {}) => {
    // Get current issue details
    const currentIssue = await prisma.issue.findUnique({
        where: { id: issueId },
        select: { id: true, status: true, title: true, sector: true, address: true, locality: true, city: true },
    });

    if (!currentIssue) return null;

    const { resolutionProofUrl, broadcastToTransparency, changerUser } = resolutionData;

    const updateData = {
        status: newStatus,
        ...(newStatus === "RESOLVED" && {
            resolvedAt: new Date(),
            resolutionProofUrl: resolutionProofUrl || null,
            resolutionRemarks: remarks || null,
            resolvedByUserId: changedBy,
        }),
    };

    const operations = [
        prisma.issue.update({
            where: { id: issueId },
            data: updateData,
            include: {
                category: {
                    select: { id: true, name: true, icon: true },
                },
                evidence: true,
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
    ];

    if (resolutionProofUrl) {
        operations.push(
            prisma.issueEvidence.create({
                data: {
                    issueId,
                    fileUrl: resolutionProofUrl,
                    fileType: "image",
                    uploadedBy: changedBy,
                },
            })
        );
    }

    const [updatedIssue, _statusHistory] = await prisma.$transaction(operations);

    // If resolved, broadcast official resolution post to government transparency dashboard / community
    if (newStatus === "RESOLVED" && broadcastToTransparency !== false) {
        try {
            const officerName = changerUser?.name || "Zonal Magistrate";
            const officerOrg = changerUser?.organization || changerUser?.sector || "Dehradun Municipal Corporation";
            const officerDesig = changerUser?.designation || "Zonal Executive Magistrate";
            await prisma.communityPost.create({
                data: {
                    title: `[RESOLVED • ${currentIssue.sector || "Municipal Sector"}] ${currentIssue.title}`,
                    content: `OFFICIAL RESOLUTION REPORT\n\nStatus: RESOLVED ✓\nAction Report: ${remarks || "Ground remediation verified and inspected."}\nZonal Magistrate: ${officerName} (${officerDesig})\nOrganization: ${officerOrg}\nAssigned Sector: ${currentIssue.sector || "Dehradun Municipal Sector"}\nLocation: ${currentIssue.address || currentIssue.locality || "Dehradun"}\n\nResolution proof photo has been published to the Government Transparency Dashboard for public verification.`,
                    imageUrl: resolutionProofUrl || null,
                    locality: currentIssue.locality || currentIssue.sector,
                    city: currentIssue.city || "Dehradun",
                    isPublished: true,
                    userId: changedBy,
                },
            });
        } catch (postErr) {
            console.error("Failed to broadcast resolution to community/transparency feed:", postErr);
        }
    }

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

/**
 * Get real-time workload and load-balancing statistics per municipal sector
 */
const getSectorWorkload = async () => {
    const { DEHRADUN_SECTORS } = require("../../utils/sectorResolver");

    const issues = await prisma.issue.findMany({
        select: {
            id: true,
            title: true,
            sector: true,
            status: true,
            priority: true,
            createdAt: true,
        },
    });

    const totalIssues = issues.length;
    const totalActive = issues.filter((i) => i.status !== "RESOLVED" && i.status !== "REJECTED").length;

    const sectors = DEHRADUN_SECTORS.map((sec) => {
        const sectorIssues = issues.filter(
            (i) => i.sector && (i.sector.includes(sec.name) || i.sector.includes(sec.id) || i.sector.toLowerCase().includes(sec.keywords[0]))
        );
        const active = sectorIssues.filter((i) => i.status !== "RESOLVED" && i.status !== "REJECTED").length;
        const resolved = sectorIssues.filter((i) => i.status === "RESOLVED").length;
        const urgent = sectorIssues.filter((i) => i.priority === "URGENT" && i.status !== "RESOLVED").length;
        const capacity = sec.capacityThreshold || 25;
        const loadRatio = capacity > 0 ? active / capacity : 0;

        let loadStatus = "OPTIMAL";
        let statusBadgeColor = "#10b981"; // green
        if (loadRatio > 1.0) {
            loadStatus = "SURGE / OVERLOAD";
            statusBadgeColor = "#ef4444"; // red
        } else if (loadRatio >= 0.7) {
            loadStatus = "HIGH LOAD";
            statusBadgeColor = "#f97316"; // orange
        } else if (loadRatio >= 0.35) {
            loadStatus = "MODERATE LOAD";
            statusBadgeColor = "#eab308"; // yellow
        }

        return {
            id: sec.id,
            name: sec.name,
            zone: sec.zone,
            center: sec.center,
            dispatchUnit: sec.dispatchUnit,
            office: sec.office,
            helpline: sec.helpline,
            totalCount: sectorIssues.length,
            activeCount: active,
            resolvedCount: resolved,
            urgentCount: urgent,
            capacityThreshold: capacity,
            loadRatio: parseFloat(loadRatio.toFixed(2)),
            loadPercentage: totalActive > 0 ? Math.round((active / totalActive) * 100) : 0,
            loadStatus,
            statusBadgeColor,
        };
    });

    return {
        totalIssues,
        totalActive,
        sectorCount: DEHRADUN_SECTORS.length,
        sectors,
    };
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
    getSectorWorkload,
};
