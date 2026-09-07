const express = require("express");
const router = express.Router();
const communityController = require("./community.controller");
const { verifyToken } = require("../../middleware/auth.middleware");

// All community routes require authentication
router.use(verifyToken);

// ─── Community Posts ───

// Create a community post
// POST /api/v1/community/posts
router.post("/posts", communityController.createPost);

// List all community posts
// GET /api/v1/community/posts
router.get("/posts", communityController.getAllPosts);

// Get single post by ID
// GET /api/v1/community/posts/:id
router.get("/posts/:id", communityController.getPostById);

// Delete a post (owner or admin)
// DELETE /api/v1/community/posts/:id
router.delete("/posts/:id", communityController.deletePost);

// ─── Post Comments (CommunityPostComment) ───

// Add comment to a post
// POST /api/v1/community/posts/:postId/comments
router.post("/posts/:postId/comments", communityController.createPostComment);

// Get comments for a post
// GET /api/v1/community/posts/:postId/comments
router.get("/posts/:postId/comments", communityController.getPostComments);

// Delete a post comment (owner or admin)
// DELETE /api/v1/community/post-comments/:id
router.delete("/post-comments/:id", communityController.deletePostComment);

// ─── Issue Comments (Comment model) ───

// Add comment to an issue
// POST /api/v1/community/issues/:issueId/comments
router.post("/issues/:issueId/comments", communityController.createIssueComment);

// Get comments for an issue (threaded, top-level only with replies)
// GET /api/v1/community/issues/:issueId/comments
router.get("/issues/:issueId/comments", communityController.getIssueComments);

// Update an issue comment (owner only)
// PATCH /api/v1/community/issue-comments/:id
router.patch("/issue-comments/:id", communityController.updateIssueComment);

// Delete an issue comment (owner or admin)
// DELETE /api/v1/community/issue-comments/:id
router.delete("/issue-comments/:id", communityController.deleteIssueComment);

module.exports = router;
