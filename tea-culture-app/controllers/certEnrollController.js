const db = require('../config/db');

const certEnrollController = {
  // 用户报名茶艺师课程
  enroll: async (req, res) => {
    try {
      const userId = req.user.id;  // 从认证中间件获取
      const { course_id, phone } = req.body || {};

      if (!course_id) {
        return res.status(400).json({ message: '课程ID不能为空' });
      }

      // 检查课程是否存在且可以报名
      const [[course]] = await db.execute(
        'SELECT id, status, max_students, current_students FROM certificate_course WHERE id = ?',
        [course_id]
      );

      if (!course) {
        return res.status(404).json({ message: '课程不存在' });
      }

      if (course.status !== 1) {
        return res.status(400).json({ message: '该课程当前不接受报名' });
      }

      if (course.current_students >= course.max_students) {
        return res.status(400).json({ message: '报名人数已满' });
      }

      // 检查是否已经报名
      const [[existing]] = await db.execute(
        'SELECT id, status FROM certificate_enroll WHERE user_id = ? AND course_id = ? ORDER BY id DESC LIMIT 1',
        [userId, course_id]
      );

      if (existing) {
        // status=2 表示已取消，允许恢复报名
        if (Number(existing.status) === 2) {
          await db.execute(
            'UPDATE certificate_enroll SET status = 0, phone = ? WHERE id = ?',
            [phone || null, existing.id]
          );

          await db.execute(
            'UPDATE certificate_course SET current_students = current_students + 1 WHERE id = ?',
            [course_id]
          );

          const [[row]] = await db.execute(
            `SELECT e.id, e.user_id, e.course_id, e.phone, e.status, e.create_time,
                    u.username, c.title as course_title
             FROM certificate_enroll e
             LEFT JOIN user u ON e.user_id = u.id
             LEFT JOIN certificate_course c ON e.course_id = c.id
             WHERE e.id = ?`,
            [existing.id]
          );

          return res.status(201).json(row);
        }

        return res.status(400).json({ message: '您已经报名过该课程' });
      }

      // 创建报名记录
      await db.execute(
        'INSERT INTO certificate_enroll (user_id, course_id, phone) VALUES (?, ?, ?)',
        [userId, course_id, phone || null]
      );

      // 更新课程当前报名人数
      await db.execute(
        'UPDATE certificate_course SET current_students = current_students + 1 WHERE id = ?',
        [course_id]
      );

      const [[row]] = await db.execute(
        `SELECT e.id, e.user_id, e.course_id, e.phone, e.status, e.create_time,
                u.username, c.title as course_title
         FROM certificate_enroll e
         LEFT JOIN user u ON e.user_id = u.id
         LEFT JOIN certificate_course c ON e.course_id = c.id
         WHERE e.id = LAST_INSERT_ID()`
      );

      res.status(201).json(row);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: '您已经报名过该课程' });
      }
      console.error(err);
      res.status(500).json({ message: '报名失败' });
    }
  },

  // 取消报名
  cancel: async (req, res) => {
    try {
      const userId = req.user.id;
      const enrollId = req.params.id;

      // 查询报名记录
      const [[enroll]] = await db.execute(
        'SELECT id, user_id, course_id, status FROM certificate_enroll WHERE id = ?',
        [enrollId]
      );

      if (!enroll) {
        return res.status(404).json({ message: '报名记录不存在' });
      }

      // 检查权限（只能取消自己的报名，除非是管理员）
      if (enroll.user_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: '无权限取消该报名' });
      }

      if (enroll.status === 2) {
        return res.status(400).json({ message: '报名已经取消' });
      }

      // 更新报名状态为已取消
      await db.execute(
        'UPDATE certificate_enroll SET status = 2 WHERE id = ?',
        [enrollId]
      );

      // 减少课程当前报名人数
      await db.execute(
        'UPDATE certificate_course SET current_students = GREATEST(0, current_students - 1) WHERE id = ?',
        [enroll.course_id]
      );

      res.json({ message: '取消报名成功' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '取消报名失败' });
    }
  },

  // 获取我的报名列表
  myEnrollments: async (req, res) => {
    try {
      const userId = req.user.id;

      const [rows] = await db.execute(
        `SELECT e.id, e.course_id, e.phone, e.status, e.create_time,
                c.title, c.description, c.level, c.duration, c.price, c.city, c.start_date
         FROM certificate_enroll e
         LEFT JOIN certificate_course c ON e.course_id = c.id
         WHERE e.user_id = ?
         ORDER BY e.create_time DESC`,
        [userId]
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '获取我的报名列表失败' });
    }
  },

  // 管理员：确认报名
  confirm: async (req, res) => {
    try {
      const enrollId = req.params.id;

      const [[enroll]] = await db.execute(
        'SELECT id, status FROM certificate_enroll WHERE id = ?',
        [enrollId]
      );

      if (!enroll) {
        return res.status(404).json({ message: '报名记录不存在' });
      }

      if (enroll.status === 1) {
        return res.status(400).json({ message: '报名已确认' });
      }

      await db.execute(
        'UPDATE certificate_enroll SET status = 1 WHERE id = ?',
        [enrollId]
      );

      res.json({ message: '确认成功' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '确认报名失败' });
    }
  },
};

module.exports = certEnrollController;
