const assignmentService = require("./assignment.service");

/**
 * POST /api/v1/assignments
 * Admin: Assign an issue to a department/staff
 */
const assignIssue = async (req, res) => {
  try {
    const { issueId, departmentId, assignedTo, remarks } = req.body;

    const assignment = await assignmentService.assignIssue({
      issueId,
      departmentId,
      assignedTo,
      assignedBy: req.user.id,
      remarks,
    });

    res.status(201).json({
      success: true,
      message: "Issue assigned successfully",
      data: assignment,
    });
  } catch (error) {
    console.error("Assign issue error:", error);

    const clientErrors = [
      "Issue not found",
      "Issue, department, and assignee are required",
      "Department not found",
      "Department is not active",
      "Assigned user not found",
      "Can only assign to staff or admin users",
    ];

    if (clientErrors.includes(error.message)) {
      const status = error.message.includes("not found") ? 404 : 400;
      return res.status(status).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: "Failed to assign issue" });
  }
};

/**
 * GET /api/v1/assignments
 * Admin: List all assignments with filters
 */
const getAllAssignments = async (req, res) => {
  try {
    const { departmentId, assignedTo, issueId, page, limit } = req.query;

    const result = await assignmentService.getAllAssignments({
      departmentId,
      assignedTo,
      issueId,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });

    res.json({
      success: true,
      data: result.assignments,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get assignments error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch assignments" });
  }
};

/**
 * GET /api/v1/assignments/my
 * Staff: Get my assigned issues
 */
const getMyAssignments = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const result = await assignmentService.getMyAssignments(req.user.id, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });

    res.json({
      success: true,
      data: result.assignments,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get my assignments error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch your assignments" });
  }
};

/**
 * GET /api/v1/assignments/:id
 * Get assignment details
 */
const getAssignmentById = async (req, res) => {
  try {
    const assignment = await assignmentService.getAssignmentById(req.params.id);

    res.json({ success: true, data: assignment });
  } catch (error) {
    console.error("Get assignment error:", error);

    if (error.message === "Assignment not found") {
      return res.status(404).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: "Failed to fetch assignment" });
  }
};

/**
 * PATCH /api/v1/assignments/:id/accept
 * Staff: Accept an assignment
 */
const acceptAssignment = async (req, res) => {
  try {
    const assignment = await assignmentService.acceptAssignment(req.params.id, req.user.id);

    res.json({
      success: true,
      message: "Assignment accepted",
      data: assignment,
    });
  } catch (error) {
    console.error("Accept assignment error:", error);

    const msg = error.message;
    if (msg === "Assignment not found") return res.status(404).json({ success: false, message: msg });
    if (msg.includes("Only the assigned") || msg.includes("already been")) {
      return res.status(403).json({ success: false, message: msg });
    }

    res.status(500).json({ success: false, message: "Failed to accept assignment" });
  }
};

/**
 * PATCH /api/v1/assignments/:id/complete
 * Staff: Complete an assignment
 */
const completeAssignment = async (req, res) => {
  try {
    const assignment = await assignmentService.completeAssignment(
      req.params.id,
      req.user.id,
      req.body.remarks
    );

    res.json({
      success: true,
      message: "Assignment completed",
      data: assignment,
    });
  } catch (error) {
    console.error("Complete assignment error:", error);

    const msg = error.message;
    if (msg === "Assignment not found") return res.status(404).json({ success: false, message: msg });
    if (msg.includes("Only the assigned") || msg.includes("must be accepted") || msg.includes("already been")) {
      return res.status(403).json({ success: false, message: msg });
    }

    res.status(500).json({ success: false, message: "Failed to complete assignment" });
  }
};

/**
 * GET /api/v1/issues/:issueId/assignments
 * Get all assignments for a specific issue
 */
const getAssignmentsByIssue = async (req, res) => {
  try {
    const assignments = await assignmentService.getAssignmentsByIssue(req.params.issueId);

    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error("Get issue assignments error:", error);

    if (error.message === "Issue not found") {
      return res.status(404).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: "Failed to fetch issue assignments" });
  }
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
