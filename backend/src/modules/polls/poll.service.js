const pollRepository = require("./poll.repository");
const crypto = require("crypto");

const VOTER_SECRET = process.env.VOTER_SECRET || (process.env.NODE_ENV === "test" ? "test-only-voter-secret" : undefined);
if (!VOTER_SECRET && process.env.NODE_ENV !== "test") {
  throw new Error("VOTER_SECRET must be configured before loading the polls module");
}

const createElection = async (data) => {
  if (!data.title || !data.electionType || !data.startDate || !data.endDate) {
    throw new Error("Missing required election fields");
  }
  if (!data.options || data.options.length < 2) {
    throw new Error("Election must have at least 2 options");
  }
  if (new Date(data.startDate) >= new Date(data.endDate)) {
    throw new Error("Start date must be before end date");
  }

  return await pollRepository.createElection(data);
};

const getElections = async (filters) => {
  return await pollRepository.getElections(filters);
};

const getElectionById = async (id) => {
  const election = await pollRepository.getElectionById(id);
  if (!election) throw new Error("Election not found");
  return election;
};

const updateElectionStatus = async (id, status) => {
  const validStatuses = ["UPCOMING", "ONGOING", "COMPLETED"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const election = await pollRepository.getElectionById(id);
  if (!election) throw new Error("Election not found");

  return await pollRepository.updateElectionStatus(id, status);
};

const castVote = async (electionId, optionId, userId, userVerified) => {
  // 1. Check identity verification
  if (!userVerified) {
    throw new Error("Identity verification required to vote");
  }

  const election = await pollRepository.getElectionById(electionId);
  if (!election) throw new Error("Election not found");

  // 2. Check election status and dates
  const now = new Date();
  if (election.status !== "ONGOING" || now < election.startDate || now > election.endDate) {
    throw new Error("Election is not currently active");
  }

  // 3. Verify option belongs to election
  const optionExists = election.options.some((opt) => opt.id === optionId);
  if (!optionExists) {
    throw new Error("Invalid option for this election");
  }

  // 4. Generate deterministic hash for this user+election to prevent double voting
  // while ensuring we don't store the actual user ID in the Vote table.
  const voterReferenceHash = crypto
    .createHmac("sha256", VOTER_SECRET)
    .update(`${userId}:${electionId}`)
    .digest("hex");

  // The database unique constraint is the final guard against duplicate votes,
  // including requests that arrive concurrently.
  try {
    return await pollRepository.castVote({ electionId, optionId, voterReferenceHash });
  } catch (error) {
    if (error.code === "P2002") throw new Error("You have already cast a vote in this election");
    throw error;
  }
};

const getElectionResults = async (electionId) => {
  const election = await pollRepository.getElectionById(electionId);
  if (!election) throw new Error("Election not found");

  const results = await pollRepository.getElectionResults(electionId);
  
  // Merge results with options to ensure options with 0 votes are included
  const resultsMap = results.reduce((acc, curr) => {
    acc[curr.optionId] = curr;
    return acc;
  }, {});

  const fullResults = election.options.map((opt) => {
    const res = resultsMap[opt.id];
    return {
      optionId: opt.id,
      title: opt.title,
      candidateName: opt.candidateName,
      symbol: opt.symbol,
      totalVotes: res ? res.totalVotes : 0,
      calculatedAt: res ? res.calculatedAt : null,
    };
  });

  // Sort by total votes descending
  fullResults.sort((a, b) => b.totalVotes - a.totalVotes);

  return {
    electionId: election.id,
    title: election.title,
    status: election.status,
    totalCastVotes: fullResults.reduce((sum, r) => sum + r.totalVotes, 0),
    results: fullResults,
  };
};

module.exports = {
  createElection,
  getElections,
  getElectionById,
  updateElectionStatus,
  castVote,
  getElectionResults,
};
