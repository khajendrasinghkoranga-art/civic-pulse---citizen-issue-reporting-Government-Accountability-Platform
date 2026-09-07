const prisma = require("../../config/database");

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  isVerified: true,
  identityVerified: true,
  isActive: true,
  createdAt: true,
};

const findUserByEmail = (email) =>
  prisma.user.findUnique({ where: { email: email.toLowerCase() } });

const createUser = (data) =>
  prisma.user.create({
    data: { ...data, email: data.email.toLowerCase() },
    select: publicUserSelect,
  });

module.exports = { findUserByEmail, createUser, publicUserSelect };
