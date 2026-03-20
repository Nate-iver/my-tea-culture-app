const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// 帖子相关路由
router.get('/', postController.list);  // 公开访问
router.get('/:id', postController.getById);  // 公开访问
router.post('/', authMiddleware, postController.create);  // 需要登录
router.put('/:id', authMiddleware, adminMiddleware, postController.update);  // 需要管理员（审核）
router.delete('/:id', authMiddleware, adminMiddleware, postController.remove);  // 需要管理员

// 评论（挂在帖子下）
router.get('/:id/comments', postController.listComments);  // 公开访问
router.post('/:id/comments', authMiddleware, postController.createComment);  // 需要登录
router.delete('/:id/comments/:commentId', authMiddleware, postController.removeComment);  // 需要登录（删除自己的评论）或管理员

module.exports = router;
