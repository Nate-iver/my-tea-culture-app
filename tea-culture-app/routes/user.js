const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// 获取当前登录用户的个人资料 GET /api/users/profile
router.get('/profile', authMiddleware, userController.profile);  // 需要登录
// 用户列表（分页） GET /api/users?page=1&pageSize=10
router.get('/', authMiddleware, adminMiddleware, userController.list);  // 管理员查看
// 用户详情 GET /api/users/:id
router.get('/:id', authMiddleware, userController.getById);  // 需要登录（查看用户信息）
// 新增用户 POST /api/users  body: { username, password, role? }
router.post('/', authMiddleware, adminMiddleware, userController.create);  // 管理员创建用户
// 更新用户 PUT /api/users/:id  body: { username?, password?, role? }
router.put('/:id', authMiddleware, adminMiddleware, userController.update);  // 管理员更新用户
// 删除用户 DELETE /api/users/:id
router.delete('/:id', authMiddleware, adminMiddleware, userController.remove);  // 管理员删除用户

module.exports = router;
