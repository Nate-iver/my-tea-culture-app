const db = require('../config/db');

// 获取当前用户的订单列表
exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const sql = `
            SELECT o.*, p.name as product_name, p.price as product_price
            FROM orders o
            LEFT JOIN product p ON o.product_id = p.id
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
        `; 
        
        const [results] = await db.query(sql, [userId]); 
        res.json({ data: results });
    } catch (err) {
        console.error('获取订单失败:', err.message);
        res.status(500).json({ message: '获取订单失败', error: err.message });
    }
};

// 获取订单详情
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const sql = `
            SELECT o.*, p.name as product_name, p.price as product_price
            FROM orders o
            LEFT JOIN product p ON o.product_id = p.id
            WHERE o.id = ? AND o.user_id = ?
        `;
        
        const [results] = await db.query(sql, [id, userId]);
        
        if (results.length === 0) {
            return res.status(404).json({ message: '订单不存在或无权访问' });
        }
        res.json({ data: results[0] });
    } catch (err) {
        console.error('获取订单详情失败:', err.message);
        res.status(500).json({ message: '获取订单详情失败', error: err.message });
    }
};

// 创建订单
exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { product_id, quantity, receiver_name, receiver_phone, receiver_address } = req.body;
        
        // 参数验证
        if (!product_id || !quantity || !receiver_name || !receiver_phone || !receiver_address) {
            return res.status(400).json({ message: '缺少必要参数' });
        }
        
        if (quantity <= 0 || quantity > 999) {
            return res.status(400).json({ message: '购买数量无效' });
        }
        
        // 检查产品是否存在
        const checkProductSql = 'SELECT * FROM product WHERE id = ?';
        const [products] = await db.query(checkProductSql, [product_id]);
        
        if (products.length === 0) {
            return res.status(404).json({ message: '产品不存在' });
        }
        
        const product = products[0];
        const unit_price = product.price;
        const total_amount = (unit_price * quantity).toFixed(2);
        
        const createOrderSql = `
            INSERT INTO orders 
            (user_id, product_id, product_type, quantity, unit_price, total_amount, receiver_name, receiver_phone, receiver_address, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.query(
            createOrderSql,
            [userId, product_id, product.type, quantity, unit_price, total_amount, receiver_name, receiver_phone, receiver_address, 'pending']
        );
        
        res.status(201).json({ 
            message: '订单创建成功',
            data: {
                id: result.insertId,
                user_id: userId,
                product_id,
                quantity,
                total_amount,
                status: 'pending'
            }
        });
    } catch (err) {
        console.error('创建订单失败:', err.message);
        res.status(500).json({ message: '创建订单失败', error: err.message });
    }
};

// 取消订单（仅待支付状态）
exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        // 检查订单是否存在且属于当前用户
        const checkSql = 'SELECT * FROM orders WHERE id = ? AND user_id = ?';
        const [orders] = await db.query(checkSql, [id, userId]);
        
        if (orders.length === 0) {
            return res.status(404).json({ message: '订单不存在或无权访问' });
        }
        
        const order = orders[0];
        if (order.status !== 'pending') {
            return res.status(400).json({ message: '只能取消待支付的订单' });
        }
        
        const updateSql = 'UPDATE orders SET status = ? WHERE id = ?';
        await db.query(updateSql, ['cancelled', id]);
        
        res.json({ message: '订单已取消' });
    } catch (err) {
        console.error('取消订单失败:', err.message);
        res.status(500).json({ message: '取消订单失败', error: err.message });
    }
};

// 管理员：获取所有订单
exports.getAllOrders = async (req, res) => {
    try {
        const sql = `
            SELECT o.*, u.username, p.name as product_name
            FROM orders o
            LEFT JOIN user u ON o.user_id = u.id
            LEFT JOIN product p ON o.product_id = p.id
            ORDER BY o.created_at DESC
        `;
        
        const [results] = await db.query(sql);
        res.json({ data: results });
    } catch (err) {
        console.error('获取订单列表失败:', err.message);
        res.status(500).json({ message: '获取订单列表失败', error: err.message });
    }
};

// 管理员：更新订单状态
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        // 验证状态值
        const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: '无效的订单状态' });
        }
        
        const sql = 'UPDATE orders SET status = ? WHERE id = ?';
        const [result] = await db.query(sql, [status, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '订单不存在' });
        }
        
        res.json({ message: '订单状态已更新', data: { id, status } });
    } catch (err) {
        console.error('更新订单状态失败:', err.message);
        res.status(500).json({ message: '更新订单状态失败', error: err.message });
    }
};

// 管理员：删除订单
exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        
        const sql = 'DELETE FROM orders WHERE id = ?';
        const [result] = await db.query(sql, [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '订单不存在' });
        }
        
        res.json({ message: '订单已删除' });
    } catch (err) {
        console.error('删除订单失败:', err.message);
        res.status(500).json({ message: '删除订单失败', error: err.message });
    }
};
