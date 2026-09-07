const departmentService = require("./department.service");

/**
 * GET /api/v1/departments
 * List all departments with filters and pagination
 */
const getAllDepartments = async (req, res) => {
  try {
    const { isActive, search, city, page, limit } = req.query;

    const result = await departmentService.getAllDepartments({
      isActive: isActive !== undefined ? isActive === "true" : undefined,
      search,
      city,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });

    res.json({
      success: true,
      data: result.departments,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
    });
  }
};

/**
 * GET /api/v1/departments/:id
 * Get a single department by ID
 */
const getDepartmentById = async (req, res) => {
  try {
    const department = await departmentService.getDepartmentById(req.params.id);

    res.json({
      success: true,
      data: department,
    });
  } catch (error) {
    console.error("Get department error:", error);

    if (error.message === "Department not found") {
      return res.status(404).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch department",
    });
  }
};

/**
 * POST /api/v1/departments
 * Create a new department (admin only)
 */
const createDepartment = async (req, res) => {
  try {
    const department = await departmentService.createDepartment(req.body);

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    console.error("Create department error:", error);

    if (error.message === "Department code already exists") {
      return res.status(409).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create department",
    });
  }
};

/**
 * PATCH /api/v1/departments/:id
 * Update a department (admin only)
 */
const updateDepartment = async (req, res) => {
  try {
    const department = await departmentService.updateDepartment(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      message: "Department updated successfully",
      data: department,
    });
  } catch (error) {
    console.error("Update department error:", error);

    if (error.message === "Department not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === "Department code already exists") {
      return res.status(409).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update department",
    });
  }
};

/**
 * PATCH /api/v1/departments/:id/status
 * Activate/deactivate a department (admin only)
 */
const toggleDepartmentActive = async (req, res) => {
  try {
    const department = await departmentService.toggleDepartmentActive(
      req.params.id,
      req.body.isActive
    );

    res.json({
      success: true,
      message: department.isActive
        ? "Department activated"
        : "Department deactivated",
      data: department,
    });
  } catch (error) {
    console.error("Toggle department error:", error);

    if (error.message === "Department not found") {
      return res.status(404).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update department status",
    });
  }
};

/**
 * GET /api/v1/departments/:id/staff
 * Get staff associated with a department
 */
const getDepartmentStaff = async (req, res) => {
  try {
    const staff = await departmentService.getDepartmentStaff(req.params.id);

    res.json({
      success: true,
      data: staff,
    });
  } catch (error) {
    console.error("Get department staff error:", error);

    if (error.message === "Department not found") {
      return res.status(404).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch department staff",
    });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  toggleDepartmentActive,
  getDepartmentStaff,
};
