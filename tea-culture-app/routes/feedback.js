const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET /api/feedback - 获取反馈列表（支持分页、status/user_id过滤）
router.get('/', authMiddleware, adminMiddleware, feedbackController.list);  // 管理员查看

// GET /api/feedback/:id - 获取单条反馈详情
router.get('/:id', authMiddleware, adminMiddleware, feedbackController.getById);  // 管理员查看

// POST /api/feedback - 用户提交反馈
router.post('/', authMiddleware, feedbackController.create);  // 需要登录

// PATCH /api/feedback/:id - 管理员处理反馈（更新状态）
router.patch('/:id', authMiddleware, adminMiddleware, feedbackController.update);  // 需要管理员

// DELETE /api/feedback/:id - 删除反馈
router.delete('/:id', authMiddleware, adminMiddleware, feedbackController.remove);  // 需要管理员

module.exports = router;
