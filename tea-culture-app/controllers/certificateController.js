const db = require('../config/db');

const certificateController = {
  // 茶艺师课程列表（分页，可按状态/级别/城市过滤）
  list: async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 10));
      const offset = (page - 1) * pageSize;
      const limitNum = Number(pageSize);
      const offsetNum = Number(offset);

      const { status, level, city } = req.query;
      const where = [];
      const params = [];

      if (status !== undefined) {
        where.push('status = ?');
        params.push(Number(status));
      }
      if (level) {
        where.push('level = ?');
        params.push(level);
      }
      if (city) {
        where.push('city LIKE ?');
        params.push(`%${city}%`);
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const [rows] = await db.execute(
        `SELECT id, title, description, level, duration, price, city, start_date, 
                max_students, current_students, status, create_time, update_time
         FROM certificate_course ${whereSql}
         ORDER BY start_date DESC
         LIMIT ${limitNum} OFFSET ${offsetNum}`,
        params
      );

      const [countRows] = await db.execute(
        `SELECT COUNT(*) AS total FROM certificate_course ${whereSql}`,
        params
      );
      const total = countRows[0] && countRows[0].total !== undefined
        ? Number(countRows[0].total)
        : 0;

      res.json({ data: rows, total, page, pageSize });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '获取课程列表失败' });
    }
  },

  // 课程详情
  getById: async (req, res) => {
    try {
      const [rows] = await db.execute(
        `SELECT id, title, description, level, duration, price, city, start_date, 
                max_students, current_students, status, create_time, update_time
         FROM certificate_course WHERE id = ?`,
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: '课程不存在' });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '获取课程详情失败' });
    }
  },

// 创建课程（管理员）
create: async (req, res) => {
  try {
    const { title, description, level, duration, price, city, start_date, max_students } = req.body || {};
    
    if (!title) {
      return res.status(400).json({ message: '课程标题不能为空' });
    }
    if (!level) {
      return res.status(400).json({ message: '课程级别不能为空' });
    }
    if (!city) {
      return res.status(400).json({ message: '开课城市不能为空' });
    }
    if (!start_date) {
      return res.status(400).json({ message: '开课时间不能为空' });
    }

    // 执行 INSERT 并从结果中获取 insertId
    const [insertResult] = await db.execute(
      `INSERT INTO certificate_course (title, description, level, duration, price, city, start_date, max_students)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, level, duration || null, price || null, city, start_date, max_students || 20]
    );

    // 使用 insertId 获取刚创建的记录
    const [rows] = await db.execute(
      'SELECT * FROM certificate_course WHERE id = ?',
      [insertResult.insertId]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[certificate-create] 错误:', err);
    res.status(500).json({ message: '创建课程失败: ' + err.message });
  }
},
  // 更新课程（管理员）
  update: async (req, res) => {
    try {
      const id = req.params.id;
      const { title, description, level, duration, price, city, start_date, max_students, status } = req.body || {};

      const [existing] = await db.execute('SELECT id FROM certificate_course WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ message: '课程不存在' });
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
      if (level !== undefined) {
        setParts.push('level = ?');
        params.push(level);
      }
      if (duration !== undefined) {
        setParts.push('duration = ?');
        params.push(duration);
      }
      if (price !== undefined) {
        setParts.push('price = ?');
        params.push(price);
      }
      if (city !== undefined) {
        setParts.push('city = ?');
        params.push(city);
      }
      if (start_date !== undefined) {
        setParts.push('start_date = ?');
        params.push(start_date);
      }
      if (max_students !== undefined) {
        setParts.push('max_students = ?');
        params.push(Number(max_students));
      }
      if (status !== undefined) {
        setParts.push('status = ?');
        params.push(Number(status));
      }

      if (setParts.length === 0) {
        return res.status(400).json({ message: '没有需要更新的字段' });
      }

      params.push(id);
      const sql = `UPDATE certificate_course SET ${setParts.join(', ')} WHERE id = ?`;
      await db.execute(sql, params);

      const [rows] = await db.execute('SELECT * FROM certificate_course WHERE id = ?', [id]);
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '更新课程失败' });
    }
  },

  // 删除课程（管理员）
  remove: async (req, res) => {
    try {
      const [result] = await db.execute('DELETE FROM certificate_course WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: '课程不存在' });
      }
      res.json({ message: '删除成功' });
    } catch (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: '该课程已有报名记录，无法删除' });
      }
      console.error(err);
      res.status(500).json({ message: '删除课程失败' });
    }
  },

  // 获取课程的报名列表
  getEnrollments: async (req, res) => {
    try {
      const courseId = req.params.id;

      const [rows] = await db.execute(
        `SELECT e.id, e.user_id, u.username, e.phone, e.status, e.create_time
         FROM certificate_enroll e
         LEFT JOIN user u ON e.user_id = u.id
         WHERE e.course_id = ?
         ORDER BY e.create_time DESC`,
        [courseId]
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '获取报名列表失败' });
    }
  },
};

module.exports = certificateController;
