const db = require('../config/db');

const commentController = {
  // 获取指定帖子的评论列表（分页）
  listByPost: async (req, res) => {
    try {
      const postId = req.params.postId;
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 10));
      const offset = (page - 1) * pageSize;
      const limitNum = Number(pageSize);
      const offsetNum = Number(offset);

      // 验证帖子是否存在
      const [postRows] = await db.execute('SELECT id FROM `post` WHERE id = ?', [postId]);
      if (postRows.length === 0) {
        return res.status(404).json({ message: '帖子不存在' });
      }

      const [rows] = await db.execute(
        `SELECT id, post_id, user_id, content, create_time
         FROM comment
         WHERE post_id = ?
         ORDER BY create_time ASC
         LIMIT ${limitNum} OFFSET ${offsetNum}`,
        [postId]
      );

      const [countRows] = await db.execute(
        'SELECT COUNT(*) AS total FROM comment WHERE post_id = ?',
        [postId]
      );
      const total = countRows[0] && countRows[0].total !== undefined
        ? Number(countRows[0].total)
        : 0;

      res.json({ list: rows, total, page, pageSize });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '获取评论列表失败' });
    }
  },

  // 获取评论详情
  getById: async (req, res) => {
    try {
      const [rows] = await db.execute(
        'SELECT id, post_id, user_id, content, create_time FROM comment WHERE id = ?',
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: '评论不存在' });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '获取评论失败' });
    }
  },

  // 新增评论
  create: async (req, res) => {
    try {
      const postId = req.params.postId;
      const { user_id, content } = req.body || {};

      if (!user_id) {
        return res.status(400).json({ message: 'user_id 不能为空' });
      }
      if (!content || content.trim() === '') {
        return res.status(400).json({ message: '评论内容不能为空' });
      }

      // 验证帖子是否存在
      const [postRows] = await db.execute('SELECT id FROM `post` WHERE id = ?', [postId]);
      if (postRows.length === 0) {
        return res.status(404).json({ message: '帖子不存在' });
      }

      await db.execute(
        'INSERT INTO comment (post_id, user_id, content) VALUES (?, ?, ?)',
        [Number(postId), Number(user_id), content.trim()]
      );

      const [[row]] = await db.execute(
        'SELECT id, post_id, user_id, content, create_time FROM comment WHERE id = LAST_INSERT_ID()'
      );
      res.status(201).json(row);
    } catch (err) {
      if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ message: 'user_id 不存在' });
      }
      console.error(err);
      res.status(500).json({ message: '发表评论失败' });
    }
  },

  // 删除评论
  remove: async (req, res) => {
    try {
      const [result] = await db.execute('DELETE FROM comment WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: '评论不存在' });
      }
      res.json({ message: '删除成功' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '删除评论失败' });
    }
  },

  // 获取指定用户的所有评论（可选功能）
  listByUser: async (req, res) => {
    try {
      const userId = req.params.userId;
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 10));
      const offset = (page - 1) * pageSize;
      const limitNum = Number(pageSize);
      const offsetNum = Number(offset);

      const [rows] = await db.execute(
        `SELECT id, post_id, user_id, content, create_time
         FROM comment
         WHERE user_id = ?
         ORDER BY create_time DESC
         LIMIT ${limitNum} OFFSET ${offsetNum}`,
        [userId]
      );

      const [countRows] = await db.execute(
        'SELECT COUNT(*) AS total FROM comment WHERE user_id = ?',
        [userId]
      );
      const total = countRows[0] && countRows[0].total !== undefined
        ? Number(countRows[0].total)
        : 0;

      res.json({ list: rows, total, page, pageSize });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '获取用户评论列表失败' });
    }
  },
};

module.exports = commentController;
