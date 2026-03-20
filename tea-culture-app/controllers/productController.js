const db = require('../config/db');

const productController = {
  // 商品列表（分页，可按 type/name/价格区间过滤）
  list: async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 10));
      const offset = (page - 1) * pageSize;
      const limitNum = Number(pageSize);
      const offsetNum = Number(offset);

      const { type, name, minPrice, maxPrice } = req.query;
      const where = [];
      const params = [];

      if (type) {
        where.push('type = ?');
        params.push(type);
      }
      if (name) {
        where.push('name LIKE ?');
        params.push(`%${name}%`);
      }
      if (minPrice !== undefined) {
        where.push('price >= ?');
        params.push(Number(minPrice));
      }
      if (maxPrice !== undefined) {
        where.push('price <= ?');
        params.push(Number(maxPrice));
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const [rows] = await db.execute(
        `SELECT id, name, price, type, image, origin, trace_code, create_time
         FROM product ${whereSql}
         ORDER BY create_time DESC
         LIMIT ${limitNum} OFFSET ${offsetNum}`,
        params
      );

      const [countRows] = await db.execute(
        `SELECT COUNT(*) AS total FROM product ${whereSql}`,
        params
      );
      const total = countRows[0] && countRows[0].total !== undefined
        ? Number(countRows[0].total)
        : 0;

      res.json({ list: rows, total, page, pageSize });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '获取商品列表失败' });
    }
  },

  // 商品详情
  getById: async (req, res) => {
    try {
      const [rows] = await db.execute(
        'SELECT id, name, price, type, description, image, origin, trace_code, create_time FROM product WHERE id = ?',
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: '商品不存在' });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '获取商品失败' });
    }
  },

  // 新增商品
  create: async (req, res) => {
    try {
      const { name, price, type, description, image, origin, trace_code } = req.body || {};
      if (!name) {
        return res.status(400).json({ message: '商品名称不能为空' });
      }
      if (price === undefined || price === null || Number.isNaN(Number(price))) {
        return res.status(400).json({ message: '价格不合法' });
      }
      const finalType = type === 'tea' || type === 'tool' ? type : 'tea';

      await db.execute(
        'INSERT INTO product (name, price, type, description, image, origin, trace_code) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          name.trim(),
          Number(price),
          finalType,
          description || null,
          image || null,
          origin || null,
          trace_code || null,
        ]
      );

      const [[row]] = await db.execute(
        'SELECT id, name, price, type, description, image, origin, trace_code, create_time FROM product WHERE id = LAST_INSERT_ID()'
      );
      res.status(201).json(row);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '创建商品失败' });
    }
  },

  // 更新商品
  update: async (req, res) => {
    try {
      const id = req.params.id;
      const { name, price, type, description, image, origin, trace_code } = req.body || {};

      const [existing] = await db.execute('SELECT id FROM product WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ message: '商品不存在' });
      }

      const setParts = [];
      const params = [];

      if (name !== undefined) {
        setParts.push('name = ?');
        params.push(name.trim());
      }
      if (price !== undefined) {
        if (price === null || Number.isNaN(Number(price))) {
          return res.status(400).json({ message: '价格不合法' });
        }
        setParts.push('price = ?');
        params.push(Number(price));
      }
      if (type !== undefined) {
        const finalType = type === 'tea' || type === 'tool' ? type : 'tea';
        setParts.push('type = ?');
        params.push(finalType);
      }
      if (description !== undefined) {
        setParts.push('description = ?');
        params.push(description);
      }
      if (image !== undefined) {
        setParts.push('image = ?');
        params.push(image);
      }
      if (origin !== undefined) {
        setParts.push('origin = ?');
        params.push(origin);
      }
      if (trace_code !== undefined) {
        setParts.push('trace_code = ?');
        params.push(trace_code);
      }

      if (setParts.length === 0) {
        return res.status(400).json({ message: '没有需要更新的字段' });
      }

      params.push(id);
      const sql = `UPDATE product SET ${setParts.join(', ')} WHERE id = ?`;
      await db.execute(sql, params);

      const [rows] = await db.execute(
        'SELECT id, name, price, type, description, image, origin, trace_code, create_time FROM product WHERE id = ?',
        [id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '更新商品失败' });
    }
  },

  // 删除商品
  remove: async (req, res) => {
    try {
      const [result] = await db.execute('DELETE FROM product WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: '商品不存在' });
      }
      res.json({ message: '删除成功' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '删除商品失败' });
    }
  },
};

module.exports = productController;
