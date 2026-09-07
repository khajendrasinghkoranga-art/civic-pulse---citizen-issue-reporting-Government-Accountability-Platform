const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authRepository = require("./auth.repository");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const registerUser = async (data) => {
  // Check if user already exists
  const email = data.email.trim().toLowerCase();
  const userExists = await authRepository.findUserByEmail(email);

  if (userExists) {
    throw new Error("User already exists with this email");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);

  // Create user
  const user = await authRepository.createUser({
      name: data.name,
      email,
      passwordHash: passwordHash,
      phone: data.phone,
      role: "CITIZEN",
  });

  const token = generateToken(user.id);

  return { user, token };
};

const loginUser = async (email, password) => {
  // Find user
  const user = await authRepository.findUserByEmail(email.trim().toLowerCase());

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.isActive) {
    throw new Error("User account is disabled");
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user.id);

  // Return user without passwordHash
  const { passwordHash, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

module.exports = {
  registerUser,
  loginUser,
};
