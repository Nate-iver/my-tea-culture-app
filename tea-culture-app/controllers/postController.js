const db = require('../config/db');

const postController = {
  // 帖子列表（分页，可按 user_id/type/status 过滤）
  list: async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 10));
      const offset = (page - 1) * pageSize;
      const limitNum = Number(pageSize);
      const offsetNum = Number(offset);

      const { user_id, type, status } = req.query;
      const where = [];
      const params = [];

      if (user_id) {
        where.push('user_id = ?');
        params.push(Number(user_id));
      }
      if (type) {
        where.push('type = ?');
        params.push(type);
      }
      if (status !== undefined) {
        where.push('status = ?');
        params.push(Number(status));
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const [rows] = await db.execute(
        `SELECT id, user_id, title, type, status, create_time
         FROM \`post\` ${whereSql}
         ORDER BY create_time DESC
         LIMIT ${limitNum} OFFSET ${offsetNum}`,
        params
      );

      const [countRows] = await db.execute(
        `SELECT COUNT(*) AS total FROM \`post\` ${whereSql}`,
        params
      );
      const total = countRows[0] && countRows[0].total !== undefined ? Number(countRows[0].total) : 0;

      res.json({ list: rows, total, page, pageSize });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '获取帖子列表失败' });
    }
  },

  // 帖子详情（含正文）
  getById: async (req, res) => {
    try {
      const [rows] = await db.execute(
        'SELECT id, user_id, title, content, type, status, create_time FROM `post` WHERE id = ?',
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: '帖子不存在' });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '获取帖子失败' });
    }
  },

  // 新增帖子（品茶笔记/交流）
  create: async (req, res) => {
    try {
      const { user_id, title, content, type, status } = req.body || {};
      if (!user_id) {
        return res.status(400).json({ message: 'user_id 不能为空' });
      }
      if (!content && !title) {
        return res.status(400).json({ message: 'title 和 content 至少填写一个' });
      }

      const finalType = type === 'tasting_note' ? 'tasting_note' : 'discussion';
      const finalStatus = status !== undefined ? Number(status) : 0;

      await db.execute(
        'INSERT INTO `post` (user_id, title, content, type, status) VALUES (?, ?, ?, ?, ?)',
        [Number(user_id), title || null, content || null, finalType, finalStatus]
      );

      const [[row]] = await db.execute(
        'SELECT id, user_id, title, content, type, status, create_time FROM `post` WHERE id = LAST_INSERT_ID()'
      );
      res.status(201).json(row);
    } catch (err) {
      if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ message: 'user_id 不存在' });
      }
      console.error(err);
      res.status(500).json({ message: '创建帖子失败' });
    }
  },

  // 更新帖子
  update: async (req, res) => {
    try {
      const id = req.params.id;
      const { title, content, type, status } = req.body || {};

      const [existing] = await db.execute('SELECT id FROM `post` WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ message: '帖子不存在' });
      }

      const setParts = [];
      const params = [];

      if (title !== undefined) {
        setParts.push('title = ?');
        params.push(title);
      }
      if (content !== undefined) {
        setParts.push('content = ?');
        params.push(content);
      }
      if (type !== undefined) {
        const finalType = type === 'tasting_note' ? 'tasting_note' : 'discussion';
        setParts.push('type = ?');
        params.push(finalType);
      }
      if (status !== undefined) {
        setParts.push('status = ?');
        params.push(Number(status));
      }

      if (setParts.length === 0) {
        return res.status(400).json({ message: '没有需要更新的字段' });
      }

      params.push(id);
      await db.execute(`UPDATE \`post\` SET ${setParts.join(', ')} WHERE id = ?`, params);

      const [rows] = await db.execute(
        'SELECT id, user_id, title, content, type, status, create_time FROM `post` WHERE id = ?',
        [id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '更新帖子失败' });
    }
  },

  // 删除帖子
  remove: async (req, res) => {
    try {
      const [result] = await db.execute('DELETE FROM `post` WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: '帖子不存在' });
      }
      res.json({ message: '删除成功' });
    } catch (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: '该帖子有关联评论，无法删除' });
      }
      console.error(err);
      res.status(500).json({ message: '删除帖子失败' });
    }
  },

  // 评论列表（按 post_id）
  listComments: async (req, res) => {
    try {
      const postId = Number(req.params.id);
      const [rows] = await db.execute(
        'SELECT id, post_id, user_id, content, create_time FROM `comment` WHERE post_id = ? ORDER BY create_time ASC',
        [postId]
      );
      res.json({ list: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '获取评论失败' });
    }
  },

  // 新增评论（对指定 post）
  createComment: async (req, res) => {
    try {
      const postId = Number(req.params.id);
      const { user_id, content } = req.body || {};

      if (!user_id) {
        return res.status(400).json({ message: 'user_id 不能为空' });
      }
      if (!content) {
        return res.status(400).json({ message: '评论内容不能为空' });
      }

      await db.execute(
        'INSERT INTO `comment` (post_id, user_id, content) VALUES (?, ?, ?)',
        [postId, Number(user_id), content]
      );
      const [[row]] = await db.execute(
        'SELECT id, post_id, user_id, content, create_time FROM `comment` WHERE id = LAST_INSERT_ID()'
      );
      res.status(201).json(row);
    } catch (err) {
      if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ message: 'post_id 或 user_id 不存在' });
      }
      console.error(err);
      res.status(500).json({ message: '创建评论失败' });
    }
  },

  // 删除评论（按 comment_id）
  removeComment: async (req, res) => {
    try {
      const commentId = Number(req.params.commentId);
      const [result] = await db.execute('DELETE FROM `comment` WHERE id = ?', [commentId]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: '评论不存在' });
      }
      res.json({ message: '删除成功' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '删除评论失败' });
    }
  },
};

module.exports = postController;
