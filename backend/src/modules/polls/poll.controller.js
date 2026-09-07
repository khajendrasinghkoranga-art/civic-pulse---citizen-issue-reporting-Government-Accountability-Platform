const pollService = require("./poll.service");

const createElection = async (req, res) => {
  try {
    const electionData = {
      ...req.body,
      createdBy: req.user.id,
    };
    
    const election = await pollService.createElection(electionData);
    
    res.status(201).json({
      success: true,
      message: "Election created successfully",
      data: election,
    });
  } catch (error) {
    console.error("Create election error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const getElections = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    
    const result = await pollService.getElections({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      status,
    });
    
    res.json({
      success: true,
      data: result.elections,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch elections" });
  }
};

const getElectionById = async (req, res) => {
  try {
    const election = await pollService.getElectionById(req.params.id);
    res.json({ success: true, data: election });
  } catch (error) {
    if (error.message === "Election not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Failed to fetch election" });
  }
};

const updateElectionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const election = await pollService.updateElectionStatus(req.params.id, status);
    
    res.json({
      success: true,
      message: "Election status updated",
      data: election,
    });
  } catch (error) {
    if (error.message === "Election not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

const castVote = async (req, res) => {
  try {
    const { optionId } = req.body;
    const electionId = req.params.id;
    
    // Pass user's identity status to enforce verified voters only
    const userVerified = req.user.identityVerified;
    
    await pollService.castVote(electionId, optionId, req.user.id, userVerified);
    
    res.status(201).json({
      success: true,
      message: "Vote cast successfully",
    });
  } catch (error) {
    const msg = error.message;
    if (msg === "Election not found") return res.status(404).json({ success: false, message: msg });
    if (msg.includes("Identity verification required") || msg.includes("already cast a vote")) {
      return res.status(403).json({ success: false, message: msg });
    }
    res.status(400).json({ success: false, message: msg });
  }
};

const getElectionResults = async (req, res) => {
  try {
    const results = await pollService.getElectionResults(req.params.id);
    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    if (error.message === "Election not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Failed to fetch results" });
  }
};

module.exports = {
  createElection,
  getElections,
  getElectionById,
  updateElectionStatus,
  castVote,
  getElectionResults,
};
