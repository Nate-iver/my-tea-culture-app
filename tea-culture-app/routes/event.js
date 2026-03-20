const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// 茶会相关路由
router.get('/', eventController.list);  // 公开访问（茶会列表）
router.get('/:id', eventController.getById);  // 公开访问（茶会详情）
router.post('/', authMiddleware, adminMiddleware, eventController.create);  // 管理员创建茶会
router.put('/:id', authMiddleware, adminMiddleware, eventController.update);  // 管理员更新茶会
router.delete('/:id', authMiddleware, adminMiddleware, eventController.remove);  // 管理员删除茶会
router.get('/:id/enrollments', authMiddleware, adminMiddleware, eventController.getEnrollments);  // 管理员查看茶会报名列表

module.exports = router;
