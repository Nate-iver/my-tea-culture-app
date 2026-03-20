const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// JWT 密钥（生产环境应该放在 .env 中）
const JWT_SECRET = process.env.JWT_SECRET || 'tea-culture-secret-key-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const authController = {
  // 用户注册
  register: async (req, res) => {
    try {
      const { username, password, role } = req.body || {};

      // 验证输入
      if (!username || !password) {
        return res.status(400).json({ message: '用户名和密码不能为空' });
      }

      if (username.trim().length < 3) {
        return res.status(400).json({ message: '用户名至少 3 个字符' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: '密码至少 6 个字符' });
      }

      // 检查用户名是否已存在
      const [existing] = await db.execute(
        'SELECT id FROM `user` WHERE username = ?',
        [username.trim()]
      );
      if (existing.length > 0) {
        return res.status(400).json({ message: '用户名已存在' });
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);
      const finalRole = role === 'admin' ? 'admin' : 'user';

      // 创建用户
      await db.execute(
        'INSERT INTO `user` (username, password, role) VALUES (?, ?, ?)',
        [username.trim(), hashedPassword, finalRole]
      );

      const [[newUser]] = await db.execute(
        'SELECT id, username, role, create_time FROM `user` WHERE id = LAST_INSERT_ID()'
      );

      // 生成 token
      const token = jwt.sign(
        { id: newUser.id, username: newUser.username, role: newUser.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.status(201).json({
        message: '注册成功',
        token,
        user: newUser,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '注册失败' });
    }
  },

  // 用户登录
  login: async (req, res) => {
    try {
      const { username, password } = req.body || {};

      // 验证输入
      if (!username || !password) {
        return res.status(400).json({ message: '用户名和密码不能为空' });
      }

      // 查询用户
      const [users] = await db.execute(
        'SELECT id, username, password, role, create_time FROM `user` WHERE username = ?',
        [username.trim()]
      );

      if (users.length === 0) {
        return res.status(401).json({ message: '用户名或密码错误' });
      }

      const user = users[0];

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: '用户名或密码错误' });
      }

      // 生成 token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // 不返回密码
      delete user.password;

      res.json({
        message: '登录成功',
        token,
        user,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '登录失败' });
    }
  },

  // 获取当前用户信息（需要 token）
  me: async (req, res) => {
    try {
      // req.user 由认证中间件设置
      const userId = req.user.id;

      const [users] = await db.execute(
        'SELECT id, username, role, create_time FROM `user` WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: '用户不存在' });
      }

      res.json(users[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '获取用户信息失败' });
    }
  },
};

module.exports = authController;
