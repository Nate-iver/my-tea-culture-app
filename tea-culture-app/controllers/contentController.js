const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// 将数据库中的图片路径映射为前端可访问的 URL
function mapCoverImage(img) {
  if (!img) return null;
  // 已经是 URL 路径（以 / 开头），直接返回
  if (img.startsWith('/')) return img;

  const lower = img.toLowerCase();
  const root = path.join(__dirname, '..');
  const imagesDir = path.join(root, 'images');
  const images2Dir = path.join(root, 'images2');

  // 取出 basename，可能没有扩展名
  const base = path.basename(img);
  const hasExt = path.extname(base) !== '';
  const candidates = [];
  if (hasExt) {
    candidates.push(base);
  } else {
    // 尝试常见图片扩展名
    ['.png', '.jpg', '.jpeg', '.webp', '.gif'].forEach((ext) => candidates.push(base + ext));
  }

  // 优先在 images2 中查找
  for (const c of candidates) {
    if (lower.includes('images2')) {
      if (fs.existsSync(path.join(images2Dir, c))) return `/images2/${c}`;
    }
  }
  // 再在 images 中查找
  for (const c of candidates) {
    if (lower.includes('images') || true) {
      if (fs.existsSync(path.join(imagesDir, c))) return `/images/${c}`;
    }
  }

  // 如果无法找到，回退到使用 basename（若无扩展名，优先假设 png）
  const fallback = hasExt ? base : `${base}.png`;
  if (lower.includes('images2')) return `/images2/${fallback}`;
  return `/images/${fallback}`;
}

const contentController = {
  // 列表（分页，可按 type/status 过滤，不返回大字段过多信息时可用）
  list: async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 10));
      const offset = (page - 1) * pageSize;
      const limitNum = Number(pageSize);
      const offsetNum = Number(offset);

      const { type, status } = req.query;
      const where = [];
      const params = [];

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
        `SELECT id, title, type, cover_image, status, create_time FROM content ${whereSql} ORDER BY create_time DESC LIMIT ${limitNum} OFFSET ${offsetNum}`,
        params
      );

      // 映射 cover_image 为可访问 URL
      const mappedRows = rows.map((r) => ({ ...r, cover_image: mapCoverImage(r.cover_image) }));

      const [countRows] = await db.execute(
        `SELECT COUNT(*) AS total FROM content ${whereSql}`,
        params
      );
      const total = countRows[0] && countRows[0].total !== undefined
        ? Number(countRows[0].total)
        : 0;

      res.json({ list: mappedRows, total, page, pageSize });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '获取内容列表失败' });
    }
  },

  // 详情
  getById: async (req, res) => {
    try {
      const [rows] = await db.execute(
        'SELECT id, title, content, type, cover_image, status, create_time FROM content WHERE id = ?',
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: '内容不存在' });
      }
      const item = rows[0];
      item.cover_image = mapCoverImage(item.cover_image);
      res.json(item);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '获取内容失败' });
    }
  },

  // 新增内容
  create: async (req, res) => {
    try {
      const { title, content, type, cover_image, status } = req.body || {};
      if (!title) {
        return res.status(400).json({ message: '标题不能为空' });
      }
      const finalStatus = status !== undefined ? Number(status) : 1;

      await db.execute(
        'INSERT INTO content (title, content, type, cover_image, status) VALUES (?, ?, ?, ?, ?)',
        [title.trim(), content || null, type || null, cover_image || null, finalStatus]
      );

      const [[row]] = await db.execute(
        'SELECT id, title, content, type, cover_image, status, create_time FROM content WHERE id = LAST_INSERT_ID()'
      );
      res.status(201).json(row);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '创建内容失败' });
    }
  },

  // 更新内容
  update: async (req, res) => {
    try {
      const id = req.params.id;
      const { title, content, type, cover_image, status } = req.body || {};

      const [existing] = await db.execute('SELECT id FROM content WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ message: '内容不存在' });
      }

      const setParts = [];
      const params = [];

      if (title !== undefined) {
        setParts.push('title = ?');
        params.push(title.trim());
      }
      if (content !== undefined) {
        setParts.push('content = ?');
        params.push(content);
      }
      if (type !== undefined) {
        setParts.push('type = ?');
        params.push(type);
      }
      if (cover_image !== undefined) {
        setParts.push('cover_image = ?');
        params.push(cover_image);
      }
      if (status !== undefined) {
        setParts.push('status = ?');
        params.push(Number(status));
      }

      if (setParts.length === 0) {
        return res.status(400).json({ message: '没有需要更新的字段' });
      }

      params.push(id);
      const sql = `UPDATE content SET ${setParts.join(', ')} WHERE id = ?`;
      await db.execute(sql, params);

      const [rows] = await db.execute(
        'SELECT id, title, content, type, cover_image, status, create_time FROM content WHERE id = ?',
        [id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '更新内容失败' });
    }
  },

  // 删除内容
  remove: async (req, res) => {
    try {
      const [result] = await db.execute('DELETE FROM content WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: '内容不存在' });
      }
      res.json({ message: '删除成功' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '删除内容失败' });
    }
  },
};

module.exports = contentController;
