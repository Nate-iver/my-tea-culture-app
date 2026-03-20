const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tea-culture-secret-key-2026';

// 验证 JWT Token 的中间件
const authMiddleware = (req, res, next) => {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    const token = authHeader.substring(7); // 移除 "Bearer " 前缀

    // 验证 token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 将用户信息附加到 req 对象
    req.user = decoded;

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '令牌已过期' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: '无效的令牌' });
    }
    return res.status(401).json({ message: '认证失败' });
  }
};

// 验证管理员权限的中间件
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: '未认证' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '需要管理员权限' });
  }

  next();
};

// 可选的认证中间件（有 token 就验证，没有也放行）
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }

    next();
  } catch (err) {
    // 可选认证失败不阻止请求
    next();
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  optionalAuthMiddleware,
};
