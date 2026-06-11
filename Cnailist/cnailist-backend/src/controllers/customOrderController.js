const db = require('../config/database');

function generateId() {
  return 'REQ-' + Date.now().toString().slice(-8);
}

// GET /api/custom-orders  — admin only
async function getAll(req, res) {
  const { status, search } = req.query;
  let sql    = 'SELECT * FROM custom_orders WHERE 1=1';
  const params = [];

  if (status) { sql += ' AND status = ?';                        params.push(status); }
  if (search) { sql += ' AND (name LIKE ? OR phone LIKE ?)';     params.push(`%${search}%`, `%${search}%`); }
  sql += ' ORDER BY created_at DESC';

  try {
    const [orders] = await db.query(sql, params);
    for (const order of orders) {
      const [images] = await db.query('SELECT * FROM custom_order_images WHERE custom_order_id = ?', [order.id]);
      order.images = images;
    }
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/custom-orders/:id
async function getOne(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM custom_orders WHERE id = ?', [req.params.id]);
    if (rows.length === 0)
      return res.status(404).json({ success: false, message: 'Custom order tidak ditemukan' });
    const [images] = await db.query('SELECT * FROM custom_order_images WHERE custom_order_id = ?', [req.params.id]);
    rows[0].images = images;
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/custom-orders  — publik
async function create(req, res) {
  const { name, phone, design_desc, nail_size, qty, deadline, budget, notes } = req.body;
  if (!name || !phone || !design_desc)
    return res.status(400).json({ success: false, message: 'Nama, telepon, dan deskripsi desain wajib diisi' });

  const id = generateId();
  try {
    await db.query(
      `INSERT INTO custom_orders (id, name, phone, design_desc, nail_size, qty, deadline, budget, notes)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [id, name, phone, design_desc, nail_size || null, parseInt(qty) || 1, deadline || null, budget || null, notes || '']
    );

    // Simpan gambar referensi kalau ada
    if (req.files?.length) {
      for (const file of req.files) {
        await db.query(
          'INSERT INTO custom_order_images (custom_order_id, image_path) VALUES (?,?)',
          [id, file.filename]
        );
      }
    }

    res.status(201).json({ success: true, message: 'Custom order berhasil dikirim', id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PUT /api/custom-orders/:id/status  — admin only
async function updateStatus(req, res) {
  const { status } = req.body;
  const valid = ['Pending','Diproses','Selesai','Dibatalkan'];
  if (!valid.includes(status))
    return res.status(400).json({ success: false, message: 'Status tidak valid' });

  try {
    await db.query('UPDATE custom_orders SET status = ?, updated_at = NOW() WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: 'Status custom order diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/custom-orders/:id  — admin only
async function remove(req, res) {
  try {
    await db.query('DELETE FROM custom_orders WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Custom order berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getAll, getOne, create, updateStatus, remove };
