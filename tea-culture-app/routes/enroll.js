const express = require('express');
const router = express.Router();
const enrollController = require('../controllers/enrollController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// 报名相关路由
router.post('/', authMiddleware, enrollController.enroll);  // 用户报名茶会
router.get('/my', authMiddleware, enrollController.myEnrollments);  // 获取我的报名列表
router.delete('/:id', authMiddleware, enrollController.cancel);  // 取消报名
router.put('/:id/confirm', authMiddleware, adminMiddleware, enrollController.confirm);  // 管理员确认报名

module.exports = router;
