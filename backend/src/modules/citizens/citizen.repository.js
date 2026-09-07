const prisma = require("../../config/database");

/**
 * Get aggregated dashboard statistics for a citizen
 */
const getCitizenDashboardStats = async (userId) => {
  const [totalIssues, resolvedIssues, communityPosts] = await Promise.all([
    prisma.issue.count({
      where: { reporterId: userId },
    }),
    prisma.issue.count({
      where: { reporterId: userId, status: "RESOLVED" },
    }),
    prisma.communityPost.count({
      where: { userId },
    }),
  ]);

  return {
    totalIssues,
    resolvedIssues,
    pendingIssues: totalIssues - resolvedIssues,
    communityPosts,
  };
};

/**
 * Verify a citizen's identity securely
 */
const verifyCitizenIdentity = async (userId, identityProofHash) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      isVerified: true,
      identityVerified: true,
      identityProofHash,
    },
    select: {
      id: true,
      name: true,
      isVerified: true,
      identityVerified: true,
    }
  });
};

module.exports = {
  getCitizenDashboardStats,
  verifyCitizenIdentity,
};
