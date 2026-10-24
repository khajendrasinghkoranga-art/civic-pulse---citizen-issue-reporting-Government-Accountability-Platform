const prisma = require("../../config/database");

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  organization: true,
  sector: true,
  designation: true,
  isVerified: true,
  identityVerified: true,
  isActive: true,
  createdAt: true,
};

const findUserByEmail = (email) =>
  prisma.user.findUnique({ where: { email: email.toLowerCase() } });

const findUserById = (id) =>
  prisma.user.findUnique({ where: { id } });

const createUser = (data) =>
  prisma.user.create({
    data: { ...data, email: data.email.toLowerCase() },
    select: publicUserSelect,
  });

const updateUserPassword = (id, passwordHash) =>
  prisma.user.update({
    where: { id },
    data: { passwordHash },
    select: publicUserSelect,
  });

// ── Refresh Token persistence ──

const createRefreshToken = (data) =>
  prisma.refreshToken.create({ data });

const findRefreshToken = (token) =>
  prisma.refreshToken.findUnique({ where: { token } });

const revokeRefreshToken = (token) =>
  prisma.refreshToken.update({
    where: { token },
    data: { revokedAt: new Date() },
  });

const revokeAllUserRefreshTokens = (userId) =>
  prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserPassword,
  createRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  publicUserSelect,
};
