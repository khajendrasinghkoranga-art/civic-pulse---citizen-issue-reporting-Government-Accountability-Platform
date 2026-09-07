const prisma = require("../../config/database");
const crypto = require("crypto");

const isWalletAddress = (address) => /^0x[a-fA-F0-9]{40}$/.test(address);

const registerIdentity = async (userId, walletAddress) => {
  if (!isWalletAddress(walletAddress)) throw new Error("Invalid wallet address");
  const normalized = walletAddress.toLowerCase();
  const existing = await prisma.blockchainIdentity.findUnique({ where: { walletAddress: normalized } });
  if (existing && existing.userId !== userId) throw new Error("Wallet address is already linked to another account");
  const identity = await prisma.$transaction(async (tx) => {
    const item = await tx.blockchainIdentity.upsert({
      where: { userId }, create: { userId, walletAddress: normalized }, update: { walletAddress: normalized },
      select: { id: true, walletAddress: true, verificationStatus: true, verifiedAt: true, userId: true, createdAt: true, updatedAt: true },
    });
    await tx.user.update({ where: { id: userId }, data: { blockchainAddress: normalized } });
    return item;
  });
  return identity;
};

const getIdentity = (userId) => prisma.blockchainIdentity.findUnique({ where: { userId }, select: { id: true, walletAddress: true, verificationStatus: true, verifiedAt: true, createdAt: true, updatedAt: true } });

const recordAudit = ({ entityType, entityId, action, data, transactionHash, blockNumber }) =>
  prisma.blockchainAudit.create({ data: { entityType, entityId, action, dataHash: data ? crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex") : undefined, transactionHash, blockNumber } });

const getAudits = async (entityType, entityId, { page = 1, limit = 20 }) => {
  const where = { entityType, entityId }; const skip = (page - 1) * limit;
  const [audits, total] = await Promise.all([prisma.blockchainAudit.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }), prisma.blockchainAudit.count({ where })]);
  return { audits, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

module.exports = { registerIdentity, getIdentity, recordAudit, getAudits };
