const departmentRepository = require("./department.repository");

/**
 * Get all departments with filters
 */
const getAllDepartments = async (filters) => {
  return await departmentRepository.getAllDepartments(filters);
};

/**
 * Get department by ID
 */
const getDepartmentById = async (id) => {
  const department = await departmentRepository.getDepartmentById(id);
  if (!department) {
    throw new Error("Department not found");
  }
  return department;
};

/**
 * Create a new department (admin only)
 */
const createDepartment = async (data) => {
  // Check code uniqueness
  const existing = await departmentRepository.getDepartmentByCode(data.code);
  if (existing) {
    throw new Error("Department code already exists");
  }

  return await departmentRepository.createDepartment(data);
};

/**
 * Update a department (admin only)
 */
const updateDepartment = async (id, data) => {
  const department = await departmentRepository.getDepartmentById(id);
  if (!department) {
    throw new Error("Department not found");
  }

  // If code is being changed, check uniqueness
  if (data.code && data.code !== department.code) {
    const existing = await departmentRepository.getDepartmentByCode(data.code);
    if (existing) {
      throw new Error("Department code already exists");
    }
  }

  return await departmentRepository.updateDepartment(id, data);
};

/**
 * Toggle department active status (admin only)
 */
const toggleDepartmentActive = async (id, isActive) => {
  const department = await departmentRepository.getDepartmentById(id);
  if (!department) {
    throw new Error("Department not found");
  }

  return await departmentRepository.toggleDepartmentActive(id, isActive);
};

/**
 * Get staff members associated with a department
 */
const getDepartmentStaff = async (id) => {
  const department = await departmentRepository.getDepartmentById(id);
  if (!department) {
    throw new Error("Department not found");
  }

  return await departmentRepository.getDepartmentStaff(id);
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  toggleDepartmentActive,
  getDepartmentStaff,
};
