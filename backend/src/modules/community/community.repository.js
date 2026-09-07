const prisma = require("../../config/database");

const postInclude = {
  user: {
    select: {
      id: true,
      name: true,
      role: true,
    },
  },
  _count: {
    select: {
      comments: true,
    },
  },
};

const postCommentInclude = {
  user: {
    select: {
      id: true,
      name: true,
      role: true,
    },
  },
};

const issueCommentInclude = {
  user: {
    select: {
      id: true,
      name: true,
      role: true,
    },
  },
  replies: {
    include: {
      user: {
        select: { id: true, name: true, role: true },
      },
    },
  },
};

// ─── Posts ───

const createPost = async (data) => {
  return await prisma.communityPost.create({
    data,
    include: postInclude,
  });
};

const getAllPosts = async ({ page = 1, limit = 20, locality, city }) => {
  const where = {};
  if (locality) where.locality = { contains: locality, mode: "insensitive" };
  if (city) where.city = { contains: city, mode: "insensitive" };

  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.communityPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: postInclude,
      skip,
      take: limit,
    }),
    prisma.communityPost.count({ where }),
  ]);

  return {
    posts,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getPostById = async (id) => {
  return await prisma.communityPost.findUnique({
    where: { id },
    include: postInclude,
  });
};

const deletePost = async (id) => {
  return await prisma.communityPost.delete({ where: { id } });
};

// ─── Post Comments (CommunityPostComment) ───

const createPostComment = async (data) => {
  return await prisma.communityPostComment.create({
    data,
    include: postCommentInclude,
  });
};

const getPostComments = async (postId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    prisma.communityPostComment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: postCommentInclude,
      skip,
      take: limit,
    }),
    prisma.communityPostComment.count({ where: { postId } }),
  ]);

  return {
    comments,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getPostCommentById = async (id) => {
  return await prisma.communityPostComment.findUnique({ where: { id } });
};

const deletePostComment = async (id) => {
  return await prisma.communityPostComment.delete({ where: { id } });
};

// ─── Issue Comments (Comment model) ───

const createIssueComment = async (data) => {
  return await prisma.comment.create({
    data,
    include: issueCommentInclude,
  });
};

const getIssueComments = async (issueId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { issueId, parentId: null },
      orderBy: { createdAt: "asc" },
      include: issueCommentInclude,
      skip,
      take: limit,
    }),
    prisma.comment.count({ where: { issueId, parentId: null } }),
  ]);

  return {
    comments,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getIssueCommentById = async (id) => {
  return await prisma.comment.findUnique({ where: { id } });
};

const updateIssueComment = async (id, comment) => {
  return await prisma.comment.update({
    where: { id },
    data: { comment, isEdited: true },
    include: issueCommentInclude,
  });
};

const deleteIssueComment = async (id) => {
  return await prisma.comment.delete({ where: { id } });
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
  createPostComment,
  getPostComments,
  getPostCommentById,
  deletePostComment,
  createIssueComment,
  getIssueComments,
  getIssueCommentById,
  updateIssueComment,
  deleteIssueComment,
};
