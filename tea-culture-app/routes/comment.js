const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET /api/posts/:postId/comments - 获取指定帖子的评论列表
router.get('/posts/:postId/comments', commentController.listByPost);  // 公开访问

// POST /api/posts/:postId/comments - 为指定帖子发表评论
router.post('/posts/:postId/comments', authMiddleware, commentController.create);  // 需要登录

// GET /api/comments/:id - 获取评论详情
router.get('/comments/:id', commentController.getById);  // 公开访问

// DELETE /api/comments/:id - 删除评论
router.delete('/comments/:id', authMiddleware, commentController.remove);  // 需要登录或管理员

// GET /api/users/:userId/comments - 获取指定用户的所有评论
router.get('/users/:userId/comments', commentController.listByUser);  // 公开访问

module.exports = router;
