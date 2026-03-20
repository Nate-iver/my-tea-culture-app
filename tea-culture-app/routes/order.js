const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// 注意：具体路径必须在参数路由之前定义

// 用户订单操作 - 需要认证
router.get('/my', authMiddleware, orderController.getMyOrders);           // 获取我的订单（必须在 /:id 之前）
router.post('/', authMiddleware, orderController.createOrder);            // 创建订单

// 管理员操作 - 需要认证且是管理员（必须在 /:id 之前）
router.get('/', authMiddleware, adminMiddleware, orderController.getAllOrders);           // 获取所有订单

// 参数路由（放在最后）
router.get('/:id', authMiddleware, orderController.getOrderById);         // 获取订单详情
router.post('/:id/cancel', authMiddleware, orderController.cancelOrder);  // 取消订单
router.put('/:id/status', authMiddleware, adminMiddleware, orderController.updateOrderStatus);  // 更新订单状态
router.delete('/:id', authMiddleware, adminMiddleware, orderController.deleteOrder);      // 删除订单

module.exports = router;
