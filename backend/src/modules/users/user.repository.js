const prisma = require("../../config/database");

// Fields to never return to the client
const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  isVerified: true,
  isActive: true,
  identityVerified: true,
  blockchainAddress: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Get all users with optional filters
 */
const getAllUsers = async ({ role, isActive, search, page = 1, limit = 20 }) => {
  const where = {};

  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: safeUserSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single user by ID with stats
 */
const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      ...safeUserSelect,
      _count: {
        select: {
          issues: true,
          comments: true,
          feedbacks: true,
          communityPosts: true,
        },
      },
    },
  });
};

/**
 * Update user role
 */
const updateUserRole = async (id, role) => {
  return await prisma.user.update({
    where: { id },
    data: { role },
    select: safeUserSelect,
  });
};

/**
 * Update user profile (name, phone)
 */
const updateUserProfile = async (id, data) => {
  return await prisma.user.update({
    where: { id },
    data,
    select: safeUserSelect,
  });
};

/**
 * Toggle user active status (activate/deactivate)
 */
const toggleUserActive = async (id, isActive) => {
  return await prisma.user.update({
    where: { id },
    data: { isActive },
    select: safeUserSelect,
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserProfile,
  toggleUserActive,
};
