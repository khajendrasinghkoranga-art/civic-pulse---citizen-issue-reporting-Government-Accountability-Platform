const userRepository = require("./user.repository");

/**
 * Get all users with filters and pagination
 */
const getAllUsers = async (filters) => {
  return await userRepository.getAllUsers(filters);
};

/**
 * Get single user by ID
 */
const getUserById = async (id) => {
  const user = await userRepository.getUserById(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

/**
 * Get own profile (for logged-in user)
 */
const getMyProfile = async (id) => {
  const user = await userRepository.getUserById(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

/**
 * Update user role (admin only)
 */
const updateUserRole = async (userId, role, requestingUser) => {
  // Prevent admins from changing their own role
  if (userId === requestingUser.id) {
    throw new Error("Cannot change your own role");
  }

  const user = await userRepository.getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  return await userRepository.updateUserRole(userId, role);
};

/**
 * Update own profile
 */
const updateMyProfile = async (userId, data) => {
  // Only allow updating name and phone
  const allowedUpdates = {};
  if (data.name) allowedUpdates.name = data.name;
  if (data.phone !== undefined) allowedUpdates.phone = data.phone;

  if (Object.keys(allowedUpdates).length === 0) {
    throw new Error("No valid fields to update");
  }

  return await userRepository.updateUserProfile(userId, allowedUpdates);
};

/**
 * Activate or deactivate a user (admin only)
 */
const toggleUserActive = async (userId, isActive, requestingUser) => {
  // Prevent admins from deactivating themselves
  if (userId === requestingUser.id) {
    throw new Error("Cannot deactivate your own account");
  }

  const user = await userRepository.getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  return await userRepository.toggleUserActive(userId, isActive);
};

module.exports = {
  getAllUsers,
  getUserById,
  getMyProfile,
  updateUserRole,
  updateMyProfile,
  toggleUserActive,
};
