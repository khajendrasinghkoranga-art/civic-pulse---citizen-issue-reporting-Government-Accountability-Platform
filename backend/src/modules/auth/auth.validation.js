const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
  phone: z
    .string()
    .optional()
    .transform((val) => (val === "" || !val ? undefined : val)),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(12, "New password must be at least 12 characters")
    .max(128, "New password must be at most 128 characters"),
});

// ── Validation middleware factories ──

const makeValidator = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    const errorDetails = error.issues || error.errors;
    const firstErrorMessage =
      errorDetails && errorDetails.length > 0
        ? errorDetails[0].message
        : "Validation failed";

    return res.status(400).json({
      success: false,
      message: firstErrorMessage,
      errors: errorDetails,
    });
  }
};

const validateRegister = makeValidator(registerSchema);
const validateLogin = makeValidator(loginSchema);
const validateRefreshToken = makeValidator(refreshTokenSchema);
const validateLogout = makeValidator(logoutSchema);
const validateChangePassword = makeValidator(changePasswordSchema);

module.exports = {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateLogout,
  validateChangePassword,
};
