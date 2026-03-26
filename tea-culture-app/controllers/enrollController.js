const db = require('../config/db');

const enrollController = {
  // 用户报名茶会
  enroll: async (req, res) => {
    try {
      const userId = req.user.id;  // 从认证中间件获取
      const { event_id, phone } = req.body || {};

      if (!event_id) {
        return res.status(400).json({ message: '茶会ID不能为空' });
      }

      // 检查茶会是否存在且可以报名
      const [[event]] = await db.execute(
        'SELECT id, status, max_participants, current_participants FROM tea_event WHERE id = ?',
        [event_id]
      );

      if (!event) {
        return res.status(404).json({ message: '茶会不存在' });
      }

      if (event.status !== 1) {
        return res.status(400).json({ message: '该茶会当前不接受报名' });
      }

      if (event.current_participants >= event.max_participants) {
        return res.status(400).json({ message: '报名人数已满' });
      }

      // 检查是否已经报名
      const [[existing]] = await db.execute(
        'SELECT id FROM event_enroll WHERE user_id = ? AND event_id = ?',
        [userId, event_id]
      );

      if (existing) {
        return res.status(400).json({ message: '您已经报名过该茶会' });
      }

      // 创建报名记录
      await db.execute(
        'INSERT INTO event_enroll (user_id, event_id, phone) VALUES (?, ?, ?)',
        [userId, event_id, phone || null]
      );

      // 更新茶会当前报名人数
      await db.execute(
        'UPDATE tea_event SET current_participants = current_participants + 1 WHERE id = ?',
        [event_id]
      );

      const [[row]] = await db.execute(
        `SELECT e.id, e.user_id, e.event_id, e.phone, e.status, e.create_time,
                u.username, t.title as event_title
         FROM event_enroll e
         LEFT JOIN user u ON e.user_id = u.id
         LEFT JOIN tea_event t ON e.event_id = t.id
         WHERE e.id = LAST_INSERT_ID()`
      );

      res.status(201).json(row);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: '您已经报名过该茶会' });
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
        'SELECT id, user_id, event_id, status FROM event_enroll WHERE id = ?',
        [enrollId]
      );

      if (!enroll) {
        return res.status(404).json({ message: '报名记录不存在' });
      }

      // 检查权限（只能取消自己的报名，除非是管理员）
      if (enroll.user_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: '无权限取消该报名' });
      }

      // 物理删除报名记录
      await db.execute('DELETE FROM event_enroll WHERE id = ?', [enrollId]);

      // 减少茶会当前报名人数
      await db.execute(
        'UPDATE tea_event SET current_participants = GREATEST(0, current_participants - 1) WHERE id = ?',
        [enroll.event_id]
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
        `SELECT e.id, e.event_id, e.phone, e.status, e.create_time,
                t.title, t.description, t.event_date, t.location, t.address
         FROM event_enroll e
         LEFT JOIN tea_event t ON e.event_id = t.id
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
        'SELECT id, status FROM event_enroll WHERE id = ?',
        [enrollId]
      );

      if (!enroll) {
        return res.status(404).json({ message: '报名记录不存在' });
      }

      if (enroll.status === 1) {
        return res.status(400).json({ message: '报名已确认' });
      }

      await db.execute(
        'UPDATE event_enroll SET status = 1 WHERE id = ?',
        [enrollId]
      );

      res.json({ message: '确认成功' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '确认报名失败' });
    }
  },
};

module.exports = enrollController;
