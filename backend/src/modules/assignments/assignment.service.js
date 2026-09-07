const assignmentRepository = require("./assignment.repository");
const prisma = require("../../config/database");

/**
 * Assign an issue to a department and staff member
 */
const assignIssue = async ({ issueId, departmentId, assignedTo, assignedBy, remarks }) => {
  if (!issueId || !departmentId || !assignedTo) {
    throw new Error("Issue, department, and assignee are required");
  }
  // Verify issue exists
  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!issue) throw new Error("Issue not found");

  // Verify department exists
  const department = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!department) throw new Error("Department not found");
  if (!department.isActive) throw new Error("Department is not active");

  // Verify assignee exists and has staff/admin role.
  const assignee = await prisma.user.findUnique({ where: { id: assignedTo } });
  if (!assignee) throw new Error("Assigned user not found");
  if (!['DEPARTMENT_STAFF', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN'].includes(assignee.role)) {
    throw new Error("Can only assign to staff or admin users");
  }

  return await assignmentRepository.createAssignment({
    issueId,
    departmentId,
    assignedTo,
    assignedBy,
    remarks,
  });
};

/**
 * Get all assignments with filters
 */
const getAllAssignments = async (filters) => {
  return await assignmentRepository.getAllAssignments(filters);
};

/**
 * Get my assignments (staff member)
 */
const getMyAssignments = async (userId, pagination) => {
  return await assignmentRepository.getMyAssignments(userId, pagination);
};

/**
 * Get assignment by ID
 */
const getAssignmentById = async (id) => {
  const assignment = await assignmentRepository.getAssignmentById(id);
  if (!assignment) throw new Error("Assignment not found");
  return assignment;
};

/**
 * Accept an assignment (only the assigned staff member can accept)
 */
const acceptAssignment = async (id, userId) => {
  const assignment = await assignmentRepository.getAssignmentById(id);
  if (!assignment) throw new Error("Assignment not found");

  if (assignment.assignedTo !== userId) {
    throw new Error("Only the assigned staff member can accept this assignment");
  }

  if (assignment.acceptedAt) {
    throw new Error("Assignment has already been accepted");
  }

  return await assignmentRepository.acceptAssignment(id);
};

/**
 * Complete an assignment (only the assigned staff member can complete)
 */
const completeAssignment = async (id, userId, remarks) => {
  const assignment = await assignmentRepository.getAssignmentById(id);
  if (!assignment) throw new Error("Assignment not found");

  if (assignment.assignedTo !== userId) {
    throw new Error("Only the assigned staff member can complete this assignment");
  }

  if (!assignment.acceptedAt) {
    throw new Error("Assignment must be accepted before it can be completed");
  }

  if (assignment.completedAt) {
    throw new Error("Assignment has already been completed");
  }

  return await assignmentRepository.completeAssignment(id, remarks);
};

/**
 * Get assignments for a specific issue
 */
const getAssignmentsByIssue = async (issueId) => {
  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!issue) throw new Error("Issue not found");

  return await assignmentRepository.getAssignmentsByIssue(issueId);
};

module.exports = {
  assignIssue,
  getAllAssignments,
  getMyAssignments,
  getAssignmentById,
  acceptAssignment,
  completeAssignment,
  getAssignmentsByIssue,
};
