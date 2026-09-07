const prisma = require("../../config/database");

/**
 * Get all departments with optional filters
 */
const getAllDepartments = async ({ isActive, search, city, page = 1, limit = 20 }) => {
  const where = {};

  if (isActive !== undefined) where.isActive = isActive;
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [departments, total] = await Promise.all([
    prisma.department.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            assignments: true,
          },
        },
      },
      skip,
      take: limit,
    }),
    prisma.department.count({ where }),
  ]);

  return {
    departments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get department by ID with staff members and assignment stats
 */
const getDepartmentById = async (id) => {
  return await prisma.department.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          assignments: true,
        },
      },
    },
  });
};

/**
 * Create a new department
 */
const createDepartment = async (data) => {
  return await prisma.department.create({
    data,
  });
};

/**
 * Update a department
 */
const updateDepartment = async (id, data) => {
  return await prisma.department.update({
    where: { id },
    data,
  });
};

/**
 * Toggle department active status
 */
const toggleDepartmentActive = async (id, isActive) => {
  return await prisma.department.update({
    where: { id },
    data: { isActive },
  });
};

/**
 * Check if a department code already exists
 */
const getDepartmentByCode = async (code) => {
  return await prisma.department.findUnique({
    where: { code },
  });
};

/**
 * Get staff members assigned to a department (via assignments)
 */
const getDepartmentStaff = async (departmentId) => {
  const assignments = await prisma.issueAssignment.findMany({
    where: { departmentId },
    select: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    distinct: ["assignedTo"],
  });

  return assignments.map((a) => a.assignee).filter(Boolean);
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  toggleDepartmentActive,
  getDepartmentByCode,
  getDepartmentStaff,
};
