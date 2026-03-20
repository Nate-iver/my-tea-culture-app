const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// 内容相关路由
// 列表（分页，可带 type/status 查询参数）
router.get('/', contentController.list);  // 公开访问（已发布内容）
// 详情
router.get('/:id', contentController.getById);  // 公开访问
// 新增
router.post('/', authMiddleware, adminMiddleware, contentController.create);  // 管理员创建内容
// 更新
router.put('/:id', authMiddleware, adminMiddleware, contentController.update);  // 管理员更新/审核
// 删除
router.delete('/:id', authMiddleware, adminMiddleware, contentController.remove);  // 管理员删除

module.exports = router;
