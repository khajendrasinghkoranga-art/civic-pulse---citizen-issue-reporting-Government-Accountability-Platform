const prisma = require("../../config/database");

const electionInclude = {
  options: true,
  creator: {
    select: { id: true, name: true, role: true },
  },
};

const createElection = async (data) => {
  return await prisma.election.create({
    data: {
      title: data.title,
      description: data.description,
      electionType: data.electionType,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      createdBy: data.createdBy,
      options: {
        create: data.options.map((opt) => ({
          title: opt.title,
          description: opt.description,
          candidateName: opt.candidateName,
          symbol: opt.symbol,
        })),
      },
    },
    include: electionInclude,
  });
};

const getElections = async ({ page = 1, limit = 20, status }) => {
  const skip = (page - 1) * limit;
  const where = status ? { status } : {};

  const [elections, total] = await Promise.all([
    prisma.election.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: electionInclude,
      skip,
      take: limit,
    }),
    prisma.election.count({ where }),
  ]);

  return {
    elections,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getElectionById = async (id) => {
  return await prisma.election.findUnique({
    where: { id },
    include: electionInclude,
  });
};

const updateElectionStatus = async (id, status) => {
  return await prisma.election.update({
    where: { id },
    data: { status },
    include: electionInclude,
  });
};

const hasVoted = async (electionId, voterReferenceHash) => {
  const vote = await prisma.vote.findFirst({
    where: { electionId, voterReferenceHash },
  });
  return !!vote;
};

const castVote = async ({ electionId, optionId, voterReferenceHash }) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Record the vote
    const vote = await tx.vote.create({
      data: {
        electionId,
        optionId,
        voterReferenceHash,
      },
    });

    // 2. Update the tally
    await tx.voteResult.upsert({
      where: {
        electionId_optionId: {
          electionId,
          optionId,
        },
      },
      update: {
        totalVotes: { increment: 1 },
        calculatedAt: new Date(),
      },
      create: {
        electionId,
        optionId,
        totalVotes: 1,
      },
    });

    return vote;
  });
};

const getElectionResults = async (electionId) => {
  return await prisma.voteResult.findMany({
    where: { electionId },
    include: {
      option: {
        select: { id: true, title: true, candidateName: true, symbol: true },
      },
    },
    orderBy: { totalVotes: "desc" },
  });
};

module.exports = {
  createElection,
  getElections,
  getElectionById,
  updateElectionStatus,
  hasVoted,
  castVote,
  getElectionResults,
};
