const prisma = require("../../config/database");

const assignmentInclude = {
  issue: {
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      locality: true,
      city: true,
    },
  },
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
      email: true,
      role: true,
    },
  },
  assigner: {
    select: {
      id: true,
      name: true,
      role: true,
    },
  },
};

/**
 * Create a new issue assignment
 */
const createAssignment = async (data) => {
  return await prisma.issueAssignment.create({
    data,
    include: assignmentInclude,
  });
};

/**
 * Get all assignments with filters and pagination
 */
const getAllAssignments = async ({ departmentId, assignedTo, issueId, page = 1, limit = 20 }) => {
  const where = {};

  if (departmentId) where.departmentId = departmentId;
  if (assignedTo) where.assignedTo = assignedTo;
  if (issueId) where.issueId = issueId;

  const skip = (page - 1) * limit;

  const [assignments, total] = await Promise.all([
    prisma.issueAssignment.findMany({
      where,
      orderBy: { assignedAt: "desc" },
      include: assignmentInclude,
      skip,
      take: limit,
    }),
    prisma.issueAssignment.count({ where }),
  ]);

  return {
    assignments,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Get assignments for a specific staff member (my assignments)
 */
const getMyAssignments = async (userId, { page = 1, limit = 20 }) => {
  const where = { assignedTo: userId };
  const skip = (page - 1) * limit;

  const [assignments, total] = await Promise.all([
    prisma.issueAssignment.findMany({
      where,
      orderBy: { assignedAt: "desc" },
      include: assignmentInclude,
      skip,
      take: limit,
    }),
    prisma.issueAssignment.count({ where }),
  ]);

  return {
    assignments,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Get assignment by ID
 */
const getAssignmentById = async (id) => {
  return await prisma.issueAssignment.findUnique({
    where: { id },
    include: assignmentInclude,
  });
};

/**
 * Accept an assignment (staff sets acceptedAt)
 */
const acceptAssignment = async (id) => {
  return await prisma.issueAssignment.update({
    where: { id },
    data: { acceptedAt: new Date() },
    include: assignmentInclude,
  });
};

/**
 * Complete an assignment (staff sets completedAt with remarks)
 */
const completeAssignment = async (id, remarks) => {
  return await prisma.issueAssignment.update({
    where: { id },
    data: {
      completedAt: new Date(),
      remarks,
    },
    include: assignmentInclude,
  });
};

/**
 * Get assignments for a specific issue
 */
const getAssignmentsByIssue = async (issueId) => {
  return await prisma.issueAssignment.findMany({
    where: { issueId },
    orderBy: { assignedAt: "desc" },
    include: assignmentInclude,
  });
};

module.exports = {
  createAssignment,
  getAllAssignments,
  getMyAssignments,
  getAssignmentById,
  acceptAssignment,
  completeAssignment,
  getAssignmentsByIssue,
};
