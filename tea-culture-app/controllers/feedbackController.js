const db = require('../config/db');

const feedbackController = {
  // 反馈列表（分页，可按 user_id/status 过滤）
  list: async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 10));
      const offset = (page - 1) * pageSize;
      const limitNum = Number(pageSize);
      const offsetNum = Number(offset);

      const { user_id, status } = req.query;
      const where = [];
      const params = [];

      if (user_id) {
        where.push('user_id = ?');
        params.push(Number(user_id));
      }
      if (status !== undefined) {
        where.push('status = ?');
        params.push(Number(status));
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const [rows] = await db.execute(
        `SELECT id, user_id, content, status, create_time
         FROM feedback ${whereSql}
         ORDER BY create_time DESC
         LIMIT ${limitNum} OFFSET ${offsetNum}`,
        params
      );

      const [countRows] = await db.execute(
        `SELECT COUNT(*) AS total FROM feedback ${whereSql}`,
        params
      );
      const total = countRows[0] && countRows[0].total !== undefined
        ? Number(countRows[0].total)
        : 0;

      res.json({ list: rows, total, page, pageSize });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '获取反馈列表失败' });
    }
  },

  // 反馈详情
  getById: async (req, res) => {
    try {
      const [rows] = await db.execute(
        'SELECT id, user_id, content, status, create_time FROM feedback WHERE id = ?',
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: '反馈不存在' });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '获取反馈失败' });
    }
  },

  // 新增反馈（用户提交）
  create: async (req, res) => {
    try {
      const { user_id, content } = req.body || {};
      if (!user_id) {
        return res.status(400).json({ message: 'user_id 不能为空' });
      }
      if (!content || content.trim() === '') {
        return res.status(400).json({ message: '反馈内容不能为空' });
      }

      await db.execute(
        'INSERT INTO feedback (user_id, content, status) VALUES (?, ?, ?)',
        [Number(user_id), content.trim(), 0]  // status 默认为 0（待处理）
      );

      const [[row]] = await db.execute(
        'SELECT id, user_id, content, status, create_time FROM feedback WHERE id = LAST_INSERT_ID()'
      );
      res.status(201).json(row);
    } catch (err) {
      if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ message: 'user_id 不存在' });
      }
      console.error(err);
      res.status(500).json({ message: '提交反馈失败' });
    }
  },

  // 更新反馈状态（管理员处理）
  update: async (req, res) => {
    try {
      const id = req.params.id;
      const { status } = req.body || {};

      const [existing] = await db.execute('SELECT id FROM feedback WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ message: '反馈不存在' });
      }

      if (status === undefined) {
        return res.status(400).json({ message: 'status 不能为空' });
      }

      const finalStatus = Number(status);
      if (![0, 1].includes(finalStatus)) {
        return res.status(400).json({ message: 'status 只能是 0（待处理）或 1（已处理）' });
      }

      await db.execute('UPDATE feedback SET status = ? WHERE id = ?', [finalStatus, id]);

      const [rows] = await db.execute(
        'SELECT id, user_id, content, status, create_time FROM feedback WHERE id = ?',
        [id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '更新反馈状态失败' });
    }
  },

  // 删除反馈
  remove: async (req, res) => {
    try {
      const [result] = await db.execute('DELETE FROM feedback WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: '反馈不存在' });
      }
      res.json({ message: '删除成功' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '删除反馈失败' });
    }
  },
};

module.exports = feedbackController;
