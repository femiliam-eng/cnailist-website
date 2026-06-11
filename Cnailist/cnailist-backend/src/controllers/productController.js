const db   = require('../config/database');
const path = require('path');
const fs   = require('fs');

// GET /api/products  — publik, bisa filter & search
async function getAll(req, res) {
  const { category, status, search, sort } = req.query;
  let sql    = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category) { sql += ' AND category = ?';              params.push(category); }
  if (status)   { sql += ' AND status = ?';                params.push(status); }
  if (search)   { sql += ' AND name LIKE ?';               params.push(`%${search}%`); }

  const sortMap = {
    'name-asc':    'name ASC',
    'name-desc':   'name DESC',
    'price-asc':   'price ASC',
    'price-desc':  'price DESC',
    'newest':      'created_at DESC',
  };
  sql += ' ORDER BY ' + (sortMap[sort] || 'created_at DESC');

  try {
    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/products/:id
async function getOne(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0)
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/products  — admin only
async function create(req, res) {
  const { name, description, price, stock, category, status } = req.body;
  if (!name || !price || !category)
    return res.status(400).json({ success: false, message: 'Nama, harga, dan kategori wajib diisi' });

  const image = req.file ? req.file.filename : null;

  try {
    const [result] = await db.query(
      'INSERT INTO products (name, description, price, stock, category, image, status) VALUES (?,?,?,?,?,?,?)',
      [name, description || '', parseInt(price), parseInt(stock) || 0, category, image, status || 'Aktif']
    );
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan', data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PUT /api/products/:id  — admin only
async function update(req, res) {
  const { name, description, price, stock, category, status } = req.body;
  const id = req.params.id;

  try {
    const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0)
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });

    // Hapus gambar lama kalau ada upload baru
    let image = existing[0].image;
    if (req.file) {
      if (image) {
        const oldPath = path.join(__dirname, '../../uploads/products', image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      image = req.file.filename;
    }

    await db.query(
      'UPDATE products SET name=?, description=?, price=?, stock=?, category=?, image=?, status=?, updated_at=NOW() WHERE id=?',
      [
        name        || existing[0].name,
        description ?? existing[0].description,
        price       ? parseInt(price)  : existing[0].price,
        stock       !== undefined ? parseInt(stock) : existing[0].stock,
        category    || existing[0].category,
        image,
        status      || existing[0].status,
        id,
      ]
    );
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    res.json({ success: true, message: 'Produk berhasil diperbarui', data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/products/:id  — admin only
async function remove(req, res) {
  try {
    const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (existing.length === 0)
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });

    // Hapus file gambar
    if (existing[0].image) {
      const imgPath = path.join(__dirname, '../../uploads/products', existing[0].image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getAll, getOne, create, update, remove };
