const userService = require("./user.service");

/**
 * GET /api/v1/users
 * Admin: List all users with filters
 */
const getAllUsers = async (req, res) => {
  try {
    const { role, isActive, search, page, limit } = req.query;

    const result = await userService.getAllUsers({
      role,
      isActive: isActive !== undefined ? isActive === "true" : undefined,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });

    res.json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

/**
 * GET /api/v1/users/me
 * Any authenticated user: Get own profile
 */
const getMyProfile = async (req, res) => {
  try {
    const user = await userService.getMyProfile(req.user.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

/**
 * PATCH /api/v1/users/me
 * Any authenticated user: Update own profile (name, phone)
 */
const updateMyProfile = async (req, res) => {
  try {
    const user = await userService.updateMyProfile(req.user.id, req.body);

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.message === "No valid fields to update") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

/**
 * GET /api/v1/users/:id
 * Admin: Get single user details
 */
const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

/**
 * PATCH /api/v1/users/:id/role
 * Admin: Update user role
 */
const updateUserRole = async (req, res) => {
  try {
    const user = await userService.updateUserRole(
      req.params.id,
      req.body.role,
      req.user
    );

    res.json({
      success: true,
      message: `User role updated to ${req.body.role}`,
      data: user,
    });
  } catch (error) {
    console.error("Update role error:", error);

    if (error.message === "User not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === "Cannot change your own role") {
      return res.status(403).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update user role",
    });
  }
};

/**
 * PATCH /api/v1/users/:id/status
 * Admin: Activate or deactivate user
 */
const toggleUserActive = async (req, res) => {
  try {
    const user = await userService.toggleUserActive(
      req.params.id,
      req.body.isActive,
      req.user
    );

    res.json({
      success: true,
      message: user.isActive ? "User activated" : "User deactivated",
      data: user,
    });
  } catch (error) {
    console.error("Toggle user error:", error);

    if (error.message === "User not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === "Cannot deactivate your own account") {
      return res.status(403).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};

module.exports = {
  getAllUsers,
  getMyProfile,
  updateMyProfile,
  getUserById,
  updateUserRole,
  toggleUserActive,
};
