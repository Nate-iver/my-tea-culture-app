const db = require('../config/db');

const eventController = {
  // 茶会列表（分页，可按状态/城市过滤）
  list: async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 10));
      const offset = (page - 1) * pageSize;
      const limitNum = Number(pageSize);
      const offsetNum = Number(offset);

      const { status, location } = req.query;
      const where = [];
      const params = [];

      if (status !== undefined) {
        where.push('status = ?');
        params.push(Number(status));
      }
      if (location) {
        where.push('location LIKE ?');
        params.push(`%${location}%`);
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const [rows] = await db.execute(
        `SELECT id, title, description, event_date, location, address, 
                max_participants, current_participants, status, create_time, update_time
         FROM tea_event ${whereSql}
         ORDER BY event_date DESC
         LIMIT ${limitNum} OFFSET ${offsetNum}`,
        params
      );

      const [countRows] = await db.execute(
        `SELECT COUNT(*) AS total FROM tea_event ${whereSql}`,
        params
      );
      const total = countRows[0] && countRows[0].total !== undefined
        ? Number(countRows[0].total)
        : 0;

      res.json({ data: rows, total, page, pageSize });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '获取茶会列表失败' });
    }
  },

  // 茶会详情
  getById: async (req, res) => {
    try {
      const [rows] = await db.execute(
        `SELECT id, title, description, event_date, location, address, 
                max_participants, current_participants, status, create_time, update_time
         FROM tea_event WHERE id = ?`,
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: '茶会不存在' });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '获取茶会详情失败' });
    }
  },

  // 创建茶会（管理员）
  create: async (req, res) => {
    try {
      const { title, description, event_date, location, address, max_participants } = req.body || {};
      
      if (!title) {
        return res.status(400).json({ message: '茶会标题不能为空' });
      }
      if (!event_date) {
        return res.status(400).json({ message: '活动时间不能为空' });
      }
      if (!location) {
        return res.status(400).json({ message: '活动地点不能为空' });
      }

      await db.execute(
        `INSERT INTO tea_event (title, description, event_date, location, address, max_participants)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [title, description || null, event_date, location, address || null, max_participants || 30]
      );

      const [[row]] = await db.execute(
        'SELECT * FROM tea_event WHERE id = LAST_INSERT_ID()'
      );
      res.status(201).json(row);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '创建茶会失败' });
    }
  },

  // 更新茶会（管理员）
  update: async (req, res) => {
    try {
      const id = req.params.id;
      const { title, description, event_date, location, address, max_participants, status } = req.body || {};

      const [existing] = await db.execute('SELECT id FROM tea_event WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ message: '茶会不存在' });
      }

      const setParts = [];
      const params = [];

      if (title !== undefined) {
        setParts.push('title = ?');
        params.push(title);
      }
      if (description !== undefined) {
        setParts.push('description = ?');
        params.push(description);
      }
      if (event_date !== undefined) {
        setParts.push('event_date = ?');
        params.push(event_date);
      }
      if (location !== undefined) {
        setParts.push('location = ?');
        params.push(location);
      }
      if (address !== undefined) {
        setParts.push('address = ?');
        params.push(address);
      }
      if (max_participants !== undefined) {
        setParts.push('max_participants = ?');
        params.push(Number(max_participants));
      }
      if (status !== undefined) {
        setParts.push('status = ?');
        params.push(Number(status));
      }

      if (setParts.length === 0) {
        return res.status(400).json({ message: '没有需要更新的字段' });
      }

      params.push(id);
      const sql = `UPDATE tea_event SET ${setParts.join(', ')} WHERE id = ?`;
      await db.execute(sql, params);

      const [rows] = await db.execute('SELECT * FROM tea_event WHERE id = ?', [id]);
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '更新茶会失败' });
    }
  },

  // 删除茶会（管理员）
  remove: async (req, res) => {
    try {
      const [result] = await db.execute('DELETE FROM tea_event WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: '茶会不存在' });
      }
      res.json({ message: '删除成功' });
    } catch (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: '该茶会已有报名记录，无法删除' });
      }
      console.error(err);
      res.status(500).json({ message: '删除茶会失败' });
    }
  },

  // 获取茶会的报名列表
  getEnrollments: async (req, res) => {
    try {
      const eventId = req.params.id;

      const [rows] = await db.execute(
        `SELECT e.id, e.user_id, u.username, e.phone, e.status, e.create_time
         FROM event_enroll e
         LEFT JOIN user u ON e.user_id = u.id
         WHERE e.event_id = ?
         ORDER BY e.create_time DESC`,
        [eventId]
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '获取报名列表失败' });
    }
  },
};

module.exports = eventController;
