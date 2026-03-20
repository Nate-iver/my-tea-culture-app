const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// 茶艺师课程相关路由
router.get('/', certificateController.list);  // 公开访问（课程列表）
router.get('/:id', certificateController.getById);  // 公开访问（课程详情）
router.post('/', authMiddleware, adminMiddleware, certificateController.create);  // 管理员创建课程
router.put('/:id', authMiddleware, adminMiddleware, certificateController.update);  // 管理员更新课程
router.delete('/:id', authMiddleware, adminMiddleware, certificateController.remove);  // 管理员删除课程
router.get('/:id/enrollments', authMiddleware, adminMiddleware, certificateController.getEnrollments);  // 管理员查看课程报名列表

module.exports = router;
