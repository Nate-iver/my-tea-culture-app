const db = require('../config/db');
const bcrypt = require('bcrypt');

const userController = {
  // 列表（分页，不返回密码）
  list: async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 10));
      const offset = (page - 1) * pageSize;
      const limitNum = Number(pageSize);
      const offsetNum = Number(offset);

      const [rows] = await db.execute(
        `SELECT id, username, role, create_time FROM \`user\` ORDER BY create_time DESC LIMIT ${limitNum} OFFSET ${offsetNum}`
      );
      const [countRows] = await db.execute('SELECT COUNT(*) AS total FROM `user`');
      const total = countRows[0] && countRows[0].total !== undefined
        ? Number(countRows[0].total)
        : 0;
      res.json({ list: rows, total, page, pageSize });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '获取用户列表失败' });
    }
  },

  // 根据 id 查询（不返回密码）
  getById: async (req, res) => {
    try {
      const [rows] = await db.execute(
        'SELECT id, username, role, create_time FROM `user` WHERE id = ?',
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: '用户不存在' });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '获取用户失败' });
    }
  },

  // 新增用户（管理员创建用户，密码加密）
  create: async (req, res) => {
    try {
      const { username, password, role } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: '用户名和密码不能为空' });
      }
      const finalRole = role === 'admin' ? 'admin' : 'user';

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      await db.execute(
        'INSERT INTO `user` (username, password, role) VALUES (?, ?, ?)',
        [username.trim(), hashedPassword, finalRole]
      );
      const [[row]] = await db.execute(
        'SELECT id, username, role, create_time FROM `user` WHERE id = LAST_INSERT_ID()'
      );
      res.status(201).json(row);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: '用户名已存在' });
      }
      console.error(err);
      res.status(500).json({ message: '创建用户失败' });
    }
  },

  // 更新用户（可更新密码、角色；不传密码则不改）
  update: async (req, res) => {
    try {
      const id = req.params.id;
      const { username, password, role } = req.body;

      const [existing] = await db.execute('SELECT id FROM `user` WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ message: '用户不存在' });
      }

      if (username !== undefined) {
        await db.execute('UPDATE `user` SET username = ? WHERE id = ?', [username.trim(), id]);
      }
      if (password !== undefined && String(password).length > 0) {
        // 加密新密码
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute('UPDATE `user` SET password = ? WHERE id = ?', [hashedPassword, id]);
      }
      if (role !== undefined) {
        const finalRole = role === 'admin' ? 'admin' : 'user';
        await db.execute('UPDATE `user` SET role = ? WHERE id = ?', [finalRole, id]);
      }

      const [rows] = await db.execute(
        'SELECT id, username, role, create_time FROM `user` WHERE id = ?',
        [id]
      );
      res.json(rows[0]);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: '用户名已存在' });
      }
      console.error(err);
      res.status(500).json({ message: '更新用户失败' });
    }
  },

  // 删除用户
  remove: async (req, res) => {
    try {
      const [result] = await db.execute('DELETE FROM `user` WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: '用户不存在' });
      }
      res.json({ message: '删除成功' });
    } catch (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ message: '该用户有关联数据，无法删除' });
      }
      console.error(err);
      res.status(500).json({ message: '删除用户失败' });
    }
  },

  // 获取当前登录用户的个人资料
  profile: async (req, res) => {
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
      res.status(500).json({ message: '获取用户资料失败' });
    }
  },
};

module.exports = userController;
