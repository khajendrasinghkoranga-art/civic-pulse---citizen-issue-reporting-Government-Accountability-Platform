const communityService = require("./community.service");

// ─── Posts ───

const createPost = async (req, res) => {
  try {
    const { title, content, imageUrl, locality, city } = req.body;

    const post = await communityService.createPost({
      title,
      content,
      imageUrl,
      locality,
      city,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ success: false, message: "Failed to create post" });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const { page, limit, locality, city } = req.query;

    const result = await communityService.getAllPosts({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      locality,
      city,
    });

    res.json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch posts" });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await communityService.getPostById(req.params.id);
    res.json({ success: true, data: post });
  } catch (error) {
    if (error.message === "Post not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Failed to fetch post" });
  }
};

const deletePost = async (req, res) => {
  try {
    await communityService.deletePost(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    if (error.message === "Post not found") return res.status(404).json({ success: false, message: error.message });
    if (error.message.includes("permission")) return res.status(403).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: "Failed to delete post" });
  }
};

// ─── Post Comments ───

const createPostComment = async (req, res) => {
  try {
    const result = await communityService.createPostComment({
      postId: req.params.postId,
      comment: req.body.comment,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Comment added",
      data: result,
    });
  } catch (error) {
    if (error.message === "Post not found") return res.status(404).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: "Failed to add comment" });
  }
};

const getPostComments = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await communityService.getPostComments(req.params.postId, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
    res.json({ success: true, data: result.comments, pagination: result.pagination });
  } catch (error) {
    if (error.message === "Post not found") return res.status(404).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: "Failed to fetch comments" });
  }
};

const deletePostComment = async (req, res) => {
  try {
    await communityService.deletePostComment(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, message: "Comment deleted" });
  } catch (error) {
    if (error.message === "Comment not found") return res.status(404).json({ success: false, message: error.message });
    if (error.message.includes("permission")) return res.status(403).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: "Failed to delete comment" });
  }
};

// ─── Issue Comments ───

const createIssueComment = async (req, res) => {
  try {
    const { comment, parentId } = req.body;
    const result = await communityService.createIssueComment({
      issueId: req.params.issueId,
      comment,
      parentId,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Comment added",
      data: result,
    });
  } catch (error) {
    const msg = error.message;
    if (msg === "Issue not found" || msg === "Parent comment not found") {
      return res.status(404).json({ success: false, message: msg });
    }
    if (msg.includes("does not belong")) {
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: "Failed to add comment" });
  }
};

const getIssueComments = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await communityService.getIssueComments(req.params.issueId, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
    res.json({ success: true, data: result.comments, pagination: result.pagination });
  } catch (error) {
    if (error.message === "Issue not found") return res.status(404).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: "Failed to fetch comments" });
  }
};

const updateIssueComment = async (req, res) => {
  try {
    const result = await communityService.updateIssueComment(req.params.id, req.user.id, req.body.comment);
    res.json({ success: true, message: "Comment updated", data: result });
  } catch (error) {
    if (error.message === "Comment not found") return res.status(404).json({ success: false, message: error.message });
    if (error.message.includes("permission")) return res.status(403).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: "Failed to update comment" });
  }
};

const deleteIssueComment = async (req, res) => {
  try {
    await communityService.deleteIssueComment(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, message: "Comment deleted" });
  } catch (error) {
    if (error.message === "Comment not found") return res.status(404).json({ success: false, message: error.message });
    if (error.message.includes("permission")) return res.status(403).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: "Failed to delete comment" });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
  createPostComment,
  getPostComments,
  deletePostComment,
  createIssueComment,
  getIssueComments,
  updateIssueComment,
  deleteIssueComment,
};
