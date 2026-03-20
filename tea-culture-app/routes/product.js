const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// 产品相关路由
router.get('/', productController.list);  // 公开访问（商品列表）
router.get('/:id', productController.getById);  // 公开访问（商品详情）
router.post('/', authMiddleware, adminMiddleware, productController.create);  // 管理员添加商品
router.put('/:id', authMiddleware, adminMiddleware, productController.update);  // 管理员更新商品
router.delete('/:id', authMiddleware, adminMiddleware, productController.remove);  // 管理员删除商品

module.exports = router;
