const communityRepository = require("./community.repository");
const prisma = require("../../config/database");

// ─── Posts ───

const createPost = async (data) => {
  return await communityRepository.createPost(data);
};

const getAllPosts = async (filters) => {
  return await communityRepository.getAllPosts(filters);
};

const getPostById = async (id) => {
  const post = await communityRepository.getPostById(id);
  if (!post) throw new Error("Post not found");
  return post;
};

const deletePost = async (id, userId, userRole) => {
  const post = await communityRepository.getPostById(id);
  if (!post) throw new Error("Post not found");

  if (post.userId !== userId && !["SUPER_ADMIN"].includes(userRole)) {
    throw new Error("You do not have permission to delete this post");
  }

  return await communityRepository.deletePost(id);
};

// ─── Post Comments (CommunityPostComment) ───

const createPostComment = async ({ postId, comment, userId }) => {
  const post = await communityRepository.getPostById(postId);
  if (!post) throw new Error("Post not found");

  return await communityRepository.createPostComment({
    postId,
    comment,
    userId,
  });
};

const getPostComments = async (postId, pagination) => {
  const post = await communityRepository.getPostById(postId);
  if (!post) throw new Error("Post not found");

  return await communityRepository.getPostComments(postId, pagination);
};

const deletePostComment = async (id, userId, userRole) => {
  const existing = await communityRepository.getPostCommentById(id);
  if (!existing) throw new Error("Comment not found");

  if (existing.userId !== userId && !["SUPER_ADMIN"].includes(userRole)) {
    throw new Error("You do not have permission to delete this comment");
  }

  return await communityRepository.deletePostComment(id);
};

// ─── Issue Comments (Comment model) ───

const createIssueComment = async ({ issueId, comment, userId, parentId }) => {
  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!issue) throw new Error("Issue not found");

  // If replying, verify parent exists and belongs to same issue
  if (parentId) {
    const parent = await communityRepository.getIssueCommentById(parentId);
    if (!parent) throw new Error("Parent comment not found");
    if (parent.issueId !== issueId) throw new Error("Parent comment does not belong to this issue");
  }

  return await communityRepository.createIssueComment({
    issueId,
    comment,
    userId,
    parentId,
  });
};

const getIssueComments = async (issueId, pagination) => {
  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!issue) throw new Error("Issue not found");

  return await communityRepository.getIssueComments(issueId, pagination);
};

const updateIssueComment = async (id, userId, comment) => {
  const existing = await communityRepository.getIssueCommentById(id);
  if (!existing) throw new Error("Comment not found");

  if (existing.userId !== userId) {
    throw new Error("You do not have permission to update this comment");
  }

  return await communityRepository.updateIssueComment(id, comment);
};

const deleteIssueComment = async (id, userId, userRole) => {
  const existing = await communityRepository.getIssueCommentById(id);
  if (!existing) throw new Error("Comment not found");

  if (existing.userId !== userId && !["SUPER_ADMIN"].includes(userRole)) {
    throw new Error("You do not have permission to delete this comment");
  }

  return await communityRepository.deleteIssueComment(id);
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
