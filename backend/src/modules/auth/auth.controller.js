const authService = require("./auth.service");

const register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    if (error.message === "User already exists with this email") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    if (error.message === "Invalid credentials" || error.message === "User account is disabled") {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    const result = await authService.refreshAccessToken(token);

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Refresh token error:", error);

    const clientErrors = [
      "Refresh token is required",
      "Invalid refresh token",
      "Refresh token has been revoked",
      "Refresh token has expired",
    ];

    if (clientErrors.includes(error.message)) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to refresh token",
    });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    await authService.logoutUser(token);

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
};

const logoutAll = async (req, res) => {
  try {
    await authService.logoutAllSessions(req.user.id);

    res.json({
      success: true,
      message: "Logged out from all sessions successfully",
    });
  } catch (error) {
    console.error("Logout all error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to logout from all sessions",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);

    res.json({
      success: true,
      message: "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    console.error("Change password error:", error);

    if (error.message === "Current password is incorrect") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

const me = async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get me error:", error);

    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch user data",
    });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { code, redirectUri, idToken, accessToken, credential, email, name, googleId } = req.body;
    const result = await authService.googleAuth({
      code,
      redirectUri,
      idToken,
      accessToken,
      credential,
      email,
      name,
      googleId,
    });

    res.json({
      success: true,
      message: "Google authentication successful",
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);

    if (error.message === "User account is disabled") {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || "Failed to authenticate with Google",
    });
  }
};

const getSectorMagistrates = async (_req, res) => {
  try {
    const prisma = require("../../config/database");
    const magistrates = await prisma.user.findMany({
      where: {
        role: "DEPARTMENT_ADMIN",
        sector: { not: null },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        organization: true,
        sector: true,
        designation: true,
      },
      orderBy: {
        sector: "asc",
      },
    });

    res.json({
      success: true,
      data: magistrates,
    });
  } catch (error) {
    console.error("Get magistrates error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sector magistrates from database",
    });
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  refreshToken,
  logout,
  logoutAll,
  changePassword,
  me,
  getSectorMagistrates,
};
