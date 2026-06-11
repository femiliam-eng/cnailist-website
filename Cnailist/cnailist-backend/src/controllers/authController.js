const db      = require('../config/database');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });

  try {
    const [rows] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
    if (rows.length === 0)
      return res.status(401).json({ success: false, message: 'Email atau password salah' });

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Email atau password salah' });

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/auth/me
async function me(req, res) {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, created_at FROM admins WHERE id = ?',
      [req.admin.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ success: false, message: 'Admin tidak ditemukan' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PUT /api/auth/change-password
async function changePassword(req, res) {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return res.status(400).json({ success: false, message: 'Password lama dan baru wajib diisi' });

  try {
    const [rows] = await db.query('SELECT * FROM admins WHERE id = ?', [req.admin.id]);
    const admin  = rows[0];
    const match  = await bcrypt.compare(oldPassword, admin.password);
    if (!match)
      return res.status(400).json({ success: false, message: 'Password lama salah' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE admins SET password = ? WHERE id = ?', [hashed, req.admin.id]);
    res.json({ success: true, message: 'Password berhasil diubah' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { login, me, changePassword };
