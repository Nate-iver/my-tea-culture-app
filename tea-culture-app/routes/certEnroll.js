const express = require('express');
const router = express.Router();
const certEnrollController = require('../controllers/certEnrollController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// 茶艺师报名相关路由
router.post('/', authMiddleware, certEnrollController.enroll);  // 用户报名课程
router.get('/my', authMiddleware, certEnrollController.myEnrollments);  // 获取我的报名列表
router.delete('/:id', authMiddleware, certEnrollController.cancel);  // 取消报名
router.put('/:id/confirm', authMiddleware, adminMiddleware, certEnrollController.confirm);  // 管理员确认报名

module.exports = router;
