const db   = require('../config/database');
const path = require('path');

// Generate ID pesanan
function generateOrderId() {
  return 'ORD-' + Date.now().toString().slice(-8);
}

// GET /api/orders  — admin only
async function getAll(req, res) {
  const { status, search, date } = req.query;
  let sql    = 'SELECT * FROM orders WHERE 1=1';
  const params = [];

  if (status) { sql += ' AND status = ?';                          params.push(status); }
  if (date)   { sql += ' AND DATE(created_at) = ?';               params.push(date); }
  if (search) { sql += ' AND (id LIKE ? OR customer_name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  sql += ' ORDER BY created_at DESC';

  try {
    const [orders] = await db.query(sql, params);

    // Ambil items tiap order
    for (const order of orders) {
      const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      order.items = items;
    }

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/orders/:id
async function getOne(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (rows.length === 0)
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });

    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
    rows[0].items = items;
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/orders  — publik (dari customer)
async function create(req, res) {
  const { customer_name, customer_phone, customer_address, payment_method, items, subtotal, shipping_cost, total, notes } = req.body;

  if (!customer_name || !customer_phone || !customer_address || !payment_method || !items?.length)
    return res.status(400).json({ success: false, message: 'Data pesanan tidak lengkap' });

  const orderId    = generateOrderId();
  const proofFile  = req.file ? req.file.filename : null;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Insert order
    await conn.query(
      `INSERT INTO orders (id, customer_name, customer_phone, customer_address, payment_method, payment_proof, subtotal, shipping_cost, total, notes)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [orderId, customer_name, customer_phone, customer_address, payment_method, proofFile,
       parseInt(subtotal), parseInt(shipping_cost) || 15000, parseInt(total), notes || '']
    );

    // Insert items & kurangi stok
    const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
    for (const item of parsedItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, name, price, qty) VALUES (?,?,?,?,?)',
        [orderId, item.id, item.name, item.price, item.qty]
      );
      await conn.query(
        'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [item.qty, item.id, item.qty]
      );
    }

    await conn.commit();
    res.status(201).json({ success: true, message: 'Pesanan berhasil dibuat', orderId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
}

// PUT /api/orders/:id/status  — admin only
async function updateStatus(req, res) {
  const { status } = req.body;
  const validStatus = ['Pending','Diproses','Dikirim','Selesai','Dibatalkan'];
  if (!validStatus.includes(status))
    return res.status(400).json({ success: false, message: 'Status tidak valid' });

  try {
    const [existing] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (existing.length === 0)
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });

    // Kalau dibatalkan, kembalikan stok
    if (status === 'Dibatalkan' && existing[0].status !== 'Dibatalkan') {
      const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
      for (const item of items) {
        await db.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.qty, item.product_id]);
      }
    }

    await db.query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: 'Status pesanan diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/orders/:id  — admin only
async function remove(req, res) {
  try {
    const [existing] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (existing.length === 0)
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });

    await db.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Pesanan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/orders/stats  — admin only
async function getStats(req, res) {
  try {
    const [[{ total_orders }]]   = await db.query('SELECT COUNT(*) as total_orders FROM orders');
    const [[{ total_revenue }]]  = await db.query("SELECT COALESCE(SUM(total),0) as total_revenue FROM orders WHERE status != 'Dibatalkan'");
    const [[{ pending_orders }]] = await db.query("SELECT COUNT(*) as pending_orders FROM orders WHERE status = 'Pending'");
    const [[{ total_products }]] = await db.query('SELECT COUNT(*) as total_products FROM products');
    const [[{ total_customers }]]= await db.query('SELECT COUNT(*) as total_customers FROM customers');

    // Penjualan 7 hari terakhir
    const [weekly] = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(total) as revenue
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND status != 'Dibatalkan'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json({
      success: true,
      data: { total_orders, total_revenue, pending_orders, total_products, total_customers, weekly }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getAll, getOne, create, updateStatus, remove, getStats };
