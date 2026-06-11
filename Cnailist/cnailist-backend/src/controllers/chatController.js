const db = require('../config/database');

// GET /api/chat/sessions  — admin: semua sesi chat
async function getSessions(req, res) {
  try {
    const [sessions] = await db.query(`
      SELECT
        session_id,
        MAX(sender_name) as name,
        COUNT(*) as total_messages,
        SUM(CASE WHEN \`from\` = 'user' AND is_read = 0 THEN 1 ELSE 0 END) as unread,
        MAX(created_at) as last_message_at,
        (SELECT message FROM chats c2 WHERE c2.session_id = c.session_id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT type FROM chats c3 WHERE c3.session_id = c.session_id ORDER BY created_at DESC LIMIT 1) as last_type
      FROM chats c
      GROUP BY session_id
      ORDER BY last_message_at DESC
    `);
    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/chat/:sessionId  — ambil semua pesan satu sesi
async function getMessages(req, res) {
  try {
    const [messages] = await db.query(
      'SELECT * FROM chats WHERE session_id = ? ORDER BY created_at ASC',
      [req.params.sessionId]
    );
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/chat  — customer kirim pesan/foto
async function sendMessage(req, res) {
  const { session_id, sender_name, message } = req.body;
  if (!session_id)
    return res.status(400).json({ success: false, message: 'session_id wajib diisi' });

  const type      = req.file ? 'image' : 'text';
  const imagePath = req.file ? req.file.filename : null;

  if (type === 'text' && !message?.trim())
    return res.status(400).json({ success: false, message: 'Pesan tidak boleh kosong' });

  try {
    const [result] = await db.query(
      'INSERT INTO chats (session_id, sender_name, `from`, type, message, image_path) VALUES (?,?,?,?,?,?)',
      [session_id, sender_name || 'Tamu', 'user', type, message?.trim() || null, imagePath]
    );
    const [rows] = await db.query('SELECT * FROM chats WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/chat/:sessionId/reply  — admin balas
async function replyMessage(req, res) {
  const { message } = req.body;
  const { sessionId } = req.params;

  const type      = req.file ? 'image' : 'text';
  const imagePath = req.file ? req.file.filename : null;

  if (type === 'text' && !message?.trim())
    return res.status(400).json({ success: false, message: 'Pesan tidak boleh kosong' });

  try {
    const [result] = await db.query(
      'INSERT INTO chats (session_id, sender_name, `from`, type, message, image_path) VALUES (?,?,?,?,?,?)',
      [sessionId, 'Admin', 'admin', type, message?.trim() || null, imagePath]
    );
    const [rows] = await db.query('SELECT * FROM chats WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PUT /api/chat/:sessionId/read  — admin tandai sudah dibaca
async function markRead(req, res) {
  try {
    await db.query(
      "UPDATE chats SET is_read = 1 WHERE session_id = ? AND `from` = 'user'",
      [req.params.sessionId]
    );
    res.json({ success: true, message: 'Pesan ditandai sudah dibaca' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/chat/:sessionId  — admin hapus sesi
async function deleteSession(req, res) {
  try {
    await db.query('DELETE FROM chats WHERE session_id = ?', [req.params.sessionId]);
    res.json({ success: true, message: 'Sesi chat dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/chat/unread-count  — admin: total unread
async function getUnreadCount(req, res) {
  try {
    const [[{ count }]] = await db.query(
      "SELECT COUNT(*) as count FROM chats WHERE `from` = 'user' AND is_read = 0"
    );
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getSessions, getMessages, sendMessage, replyMessage, markRead, deleteSession, getUnreadCount };
