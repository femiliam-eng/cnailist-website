// ===== CHAT WIDGET - Support Teks & Foto =====
// Menggunakan API backend bila tersedia, fallback ke localStorage

const CHAT_KEY    = 'cnailist_chats';
const SESSION_KEY = 'cnailist_session';

// ===== SESSION =====
function getSessionId() {
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

// ===== CHAT API WRAPPER (dengan fallback localStorage) =====
async function fetchChatMessages() {
  const sid = getSessionId();
  try {
    if (typeof chatAPI !== 'undefined') {
      const res = await chatAPI.getMessages(sid);
      // Sinkron ke localStorage untuk notif admin
      const all = getAllChats();
      all[sid] = {
        sessionId: sid,
        name: 'Tamu',
        unreadAdmin: 0,
        messages: res.data.map(m => ({
          id: m.id,
          from: m.from,
          type: m.type,
          text: m.message,
          image: m.image_path ? 'http://localhost/cnailist-laravel-backend/public/storage/chat/' + m.image_path : null,
          time: m.created_at,
          read: !!m.is_read,
        })),
      };
      saveChats(all);
      return all[sid];
    }
  } catch (_) { /* fallback */ }
  return getMyChats();
}

async function postChatMessage(text) {
  const sid = getSessionId();
  try {
    if (typeof chatAPI !== 'undefined') {
      const fd = new FormData();
      fd.append('session_id', sid);
      fd.append('sender_name', 'Tamu');
      fd.append('message', text);
      await chatAPI.sendMessage(fd);
      return true;
    }
  } catch (_) { /* fallback */ }
  return false;
}

async function postChatImage(file) {
  const sid = getSessionId();
  try {
    if (typeof chatAPI !== 'undefined') {
      const fd = new FormData();
      fd.append('session_id', sid);
      fd.append('sender_name', 'Tamu');
      fd.append('image', file);
      await chatAPI.sendMessage(fd);
      return true;
    }
  } catch (_) { /* fallback */ }
  return false;
}

// ===== LOCALSTORAGE FALLBACK =====
function getAllChats() {
  return JSON.parse(localStorage.getItem(CHAT_KEY) || '{}');
}

function saveChats(chats) {
  localStorage.setItem(CHAT_KEY, JSON.stringify(chats));
}

function getMyChats() {
  const sid = getSessionId();
  const all = getAllChats();
  if (!all[sid]) {
    all[sid] = { sessionId: sid, name: 'Tamu', unreadAdmin: 0, messages: [] };
    saveChats(all);
  }
  return all[sid];
}

function saveMyChat(data) {
  const sid = getSessionId();
  const all = getAllChats();
  all[sid] = data;
  saveChats(all);
}

// ===== KIRIM PESAN TEKS =====
async function sendUserMessage(text) {
  if (!text.trim()) return;

  // Optimistic update di localStorage
  const chat = getMyChats();
  const msg  = {
    id: Date.now(), from: 'user', type: 'text',
    text: text.trim(), time: new Date().toISOString(), read: false,
  };
  chat.messages.push(msg);
  chat.unreadAdmin = (chat.unreadAdmin || 0) + 1;
  saveMyChat(chat);
  renderChatMessages();

  // Kirim ke API
  const sent = await postChatMessage(text.trim());

  // Auto reply hanya kalau backend tidak tersedia
  if (!sent) {
    setTimeout(() => autoReply(text), 1200);
  } else {
    // Poll sekali setelah 1.5 detik untuk ambil balasan admin
    setTimeout(async () => {
      await fetchChatMessages();
      renderChatMessages();
      updateChatBadge();
    }, 1500);
  }
}

// ===== KIRIM FOTO =====
async function sendUserImage(file) {
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    alert('Ukuran foto maksimal 5MB!');
    return;
  }

  const reader = new FileReader();
  reader.onload = async e => {
    // Optimistic update
    const chat = getMyChats();
    chat.messages.push({
      id: Date.now(), from: 'user', type: 'image',
      image: e.target.result, fileName: file.name,
      time: new Date().toISOString(), read: false,
    });
    chat.unreadAdmin = (chat.unreadAdmin || 0) + 1;
    saveMyChat(chat);
    renderChatMessages();

    const sent = await postChatImage(file);

    if (!sent) {
      // Fallback auto reply
      setTimeout(() => {
        const c = getMyChats();
        c.messages.push({
          id: Date.now(), from: 'admin', type: 'text',
          text: 'Foto referensinya sudah kami terima! 📸 Admin akan segera mereview dan menghubungimu ya 💅',
          time: new Date().toISOString(), read: false,
        });
        saveMyChat(c);
        renderChatMessages();
        updateChatBadge();
      }, 1400);
    } else {
      setTimeout(async () => {
        await fetchChatMessages();
        renderChatMessages();
        updateChatBadge();
      }, 1500);
    }
  };
  reader.readAsDataURL(file);
}

// ===== AUTO REPLY (fallback saat backend tidak tersedia) =====
function autoReply(userMsg) {
  const replies = [
    'Kami akan segera membalas pesanmu ya! 💕',
    'Ada yang bisa kami bantu?',
    'Produk kami tersedia dalam berbagai pilihan warna dan model 🌸',
  ];
  const chat  = getMyChats();
  const lower = userMsg.toLowerCase();
  let reply;
  if (lower.includes('custom'))
    reply = 'Untuk custom order, silakan kirim foto referensi desain yang kamu inginkan ya! 💅 Atau kunjungi halaman Custom Order kami.';
  else if (lower.includes('harga') || lower.includes('berapa'))
    reply = 'Harga produk kami mulai dari Rp 75.000 per set. Cek koleksi lengkapnya di halaman Produk ya! 💕';
  else if (lower.includes('stok') || lower.includes('tersedia'))
    reply = 'Stok kami selalu update! Silakan cek langsung di halaman produk 🛍️';
  else if (lower.includes('kirim') || lower.includes('ongkir'))
    reply = 'Kami melayani pengiriman ke seluruh Indonesia! Ongkir mulai Rp 15.000 🚚';
  else if (lower.includes('halo') || lower.includes('hai') || lower.includes('hi'))
    reply = 'Halo! Selamat datang di Cnailist 💅 Ada yang bisa kami bantu? Kamu juga bisa kirim foto referensi desain kuku impianmu!';
  else
    reply = replies[Math.floor(Math.random() * replies.length)];

  chat.messages.push({
    id: Date.now(), from: 'admin', type: 'text',
    text: reply, time: new Date().toISOString(), read: false,
  });
  saveMyChat(chat);
  renderChatMessages();
  updateChatBadge();
}

// ===== FORMAT WAKTU =====
function formatChatTime(iso) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// ===== RENDER BUBBLE =====
function renderBubble(m) {
  const isUser  = m.from === 'user';
  const align   = isUser ? 'flex-end' : 'flex-start';
  const bgColor = isUser ? '#e91e8c' : '#f0f0f0';
  const txColor = isUser ? '#fff' : '#333';
  const radius  = isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px';
  const marginSide = isUser ? 'margin-right:4px' : 'margin-left:4px';

  let content = '';
  if (m.type === 'image') {
    const imgSrc = m.image || '';
    content = `
      <div style="
        max-width:78%; cursor:pointer;
        border-radius:${radius}; overflow:hidden;
        border:2px solid ${isUser ? 'rgba(255,255,255,0.3)' : '#e0e0e0'};
      " onclick="openImagePreview('${imgSrc}')">
        <img src="${imgSrc}" alt="foto"
          style="width:100%;max-width:200px;display:block;object-fit:cover;max-height:180px;" />
        <div style="
          padding:5px 10px;font-size:0.72rem;
          background:${bgColor};color:${txColor};
        ">
          <i class="fas fa-search-plus" style="margin-right:4px"></i>Klik untuk perbesar
        </div>
      </div>
    `;
  } else {
    content = `
      <div style="
        max-width:78%; padding:9px 13px;
        border-radius:${radius};
        background:${bgColor}; color:${txColor};
        font-size:0.83rem; line-height:1.5; word-break:break-word;
      ">${m.text}</div>
    `;
  }

  return `
    <div style="display:flex;flex-direction:column;align-items:${align};margin-bottom:10px">
      ${!isUser ? `<span style="font-size:0.68rem;color:#e91e8c;font-weight:700;margin-bottom:3px;margin-left:4px">Cnailist Admin</span>` : ''}
      ${content}
      <span style="font-size:0.65rem;color:#bbb;margin-top:3px;${marginSide}">${formatChatTime(m.time)}</span>
    </div>
  `;
}

// ===== RENDER SEMUA PESAN =====
function renderChatMessages() {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  const chat = getMyChats();

  if (chat.messages.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:30px 16px;color:#aaa">
        <div style="font-size:2.5rem;margin-bottom:10px">💅</div>
        <p style="font-size:0.82rem">Halo! Ada yang bisa kami bantu?</p>
        <p style="font-size:0.78rem;margin-top:6px;color:#ccc">Kamu bisa kirim pesan atau foto referensi desain kuku impianmu 📸</p>
      </div>
    `;
    return;
  }

  container.innerHTML = chat.messages.map(renderBubble).join('');
  container.scrollTop = container.scrollHeight;
}

// ===== LIGHTBOX FOTO =====
function openImagePreview(src) {
  let overlay = document.getElementById('chatImgOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'chatImgOverlay';
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.85);
      z-index:99999;display:flex;align-items:center;justify-content:center;
      cursor:zoom-out;padding:20px;
    `;
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div style="position:relative;max-width:90vw;max-height:90vh">
      <img src="${src}" style="max-width:100%;max-height:90vh;border-radius:12px;display:block;box-shadow:0 8px 40px rgba(0,0,0,0.5)" />
      <button onclick="document.getElementById('chatImgOverlay').remove()" style="
        position:absolute;top:-12px;right:-12px;
        background:#e91e8c;color:#fff;border:none;
        width:32px;height:32px;border-radius:50%;
        font-size:1rem;cursor:pointer;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
      ">&times;</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

// ===== BADGE =====
function updateChatBadge() {
  const badge = document.getElementById('chatBubbleBadge');
  if (!badge) return;
  const unread = getMyChats().messages.filter(m => m.from === 'admin' && !m.read).length;
  badge.textContent = unread;
  badge.style.display = unread > 0 ? 'flex' : 'none';
}

function markAdminMessagesRead() {
  const chat = getMyChats();
  chat.messages.forEach(m => { if (m.from === 'admin') m.read = true; });
  saveMyChat(chat);
  updateChatBadge();
}

// ===== POLLING (ambil pesan baru dari backend setiap 5 detik saat widget terbuka) =====
let _chatPollInterval = null;

function startChatPolling() {
  if (_chatPollInterval) return;
  _chatPollInterval = setInterval(async () => {
    const widget = document.getElementById('chatWidget');
    if (widget && widget.classList.contains('open')) {
      await fetchChatMessages();
      renderChatMessages();
      updateChatBadge();
    }
  }, 5000);
}

function stopChatPolling() {
  if (_chatPollInterval) {
    clearInterval(_chatPollInterval);
    _chatPollInterval = null;
  }
}

// ===== INIT WIDGET =====
function initChatWidget() {
  const html = `
    <!-- BUBBLE -->
    <div id="chatBubble" onclick="toggleChat()" style="
      position:fixed;bottom:28px;right:28px;
      width:54px;height:54px;background:#e91e8c;border-radius:50%;
      display:flex;align-items:center;justify-content:center;cursor:pointer;
      box-shadow:0 4px 20px rgba(233,30,140,0.4);z-index:9998;
      transition:transform 0.2s;
    " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
      <i class="fas fa-comment-dots" style="color:#fff;font-size:1.3rem" id="chatBubbleIcon"></i>
      <span id="chatBubbleBadge" style="
        display:none;position:absolute;top:-4px;right:-4px;
        background:#ff4444;color:#fff;font-size:0.65rem;font-weight:700;
        width:18px;height:18px;border-radius:50%;
        align-items:center;justify-content:center;border:2px solid #fff;
      ">0</span>
    </div>

    <!-- WIDGET -->
    <div id="chatWidget" style="
      position:fixed;bottom:94px;right:28px;width:320px;
      background:#fff;border-radius:20px;
      box-shadow:0 8px 40px rgba(0,0,0,0.15);
      z-index:9997;display:flex;flex-direction:column;
      overflow:hidden;max-height:480px;
      opacity:0;transform:translateY(20px) scale(0.95);
      pointer-events:none;
      transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);
    ">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#e91e8c,#c2185b);padding:14px 16px;display:flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.1rem">💅</div>
        <div style="flex:1">
          <p style="color:#fff;font-weight:700;font-size:0.9rem">Cnailist Support</p>
          <p style="color:rgba(255,255,255,0.75);font-size:0.72rem">
            <span style="display:inline-block;width:7px;height:7px;background:#4caf50;border-radius:50%;margin-right:4px"></span>Online · Bisa kirim foto 📸
          </p>
        </div>
        <button onclick="toggleChat()" style="background:rgba(255,255,255,0.2);border:none;color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:0.9rem;display:flex;align-items:center;justify-content:center">✕</button>
      </div>

      <!-- Preview foto sebelum kirim -->
      <div id="chatImgPreviewBar" style="display:none;padding:8px 12px;background:#fdf0f5;border-bottom:1px solid #f0d0dc;align-items:center;gap:8px;">
        <img id="chatImgPreviewThumb" src="" style="width:44px;height:44px;object-fit:cover;border-radius:8px;border:1px solid #f0d0dc;" />
        <div style="flex:1;min-width:0">
          <p id="chatImgPreviewName" style="font-size:0.75rem;font-weight:600;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></p>
          <p style="font-size:0.7rem;color:#aaa">Siap dikirim</p>
        </div>
        <button onclick="cancelImagePreview()" style="background:none;border:none;color:#e91e8c;cursor:pointer;font-size:1rem;padding:4px">&times;</button>
      </div>

      <!-- Messages -->
      <div id="chatMessages" style="flex:1;overflow-y:auto;padding:14px;min-height:200px;max-height:300px;background:#fafafa"></div>

      <!-- Input area -->
      <div style="padding:8px 10px;border-top:1px solid #f0d0dc;background:#fff;">
        <div style="display:flex;gap:6px;align-items:center;">
          <!-- Tombol foto -->
          <button onclick="document.getElementById('chatFileInput').click()" title="Kirim foto" style="
            width:34px;height:34px;border-radius:50%;border:1.5px solid #f0d0dc;
            background:#fff;color:#e91e8c;cursor:pointer;font-size:0.9rem;
            display:flex;align-items:center;justify-content:center;flex-shrink:0;
            transition:all 0.2s;
          " onmouseover="this.style.background='#fce4ec'" onmouseout="this.style.background='#fff'">
            <i class="fas fa-image"></i>
          </button>
          <input type="file" id="chatFileInput" accept="image/*" style="display:none" onchange="handleChatImageSelect(this)" />

          <!-- Input teks -->
          <input id="chatInput" type="text" placeholder="Ketik pesan atau kirim foto..." style="
            flex:1;border:1.5px solid #f0d0dc;border-radius:20px;
            padding:8px 13px;font-size:0.82rem;outline:none;
            font-family:inherit;transition:border-color 0.2s;
          "
          onfocus="this.style.borderColor='#e91e8c'"
          onblur="this.style.borderColor='#f0d0dc'"
          onkeydown="if(event.key==='Enter')sendChatFromWidget()" />

          <!-- Tombol kirim -->
          <button onclick="sendChatFromWidget()" style="
            width:34px;height:34px;background:#e91e8c;border:none;border-radius:50%;
            color:#fff;cursor:pointer;font-size:0.85rem;
            display:flex;align-items:center;justify-content:center;flex-shrink:0;
            transition:background 0.2s;
          " onmouseover="this.style.background='#c2185b'" onmouseout="this.style.background='#e91e8c'">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
  updateChatBadge();
}

// ===== HANDLE PILIH FOTO =====
let _pendingImageFile = null;

function handleChatImageSelect(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    alert('Ukuran foto maksimal 5MB!');
    input.value = '';
    return;
  }
  _pendingImageFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    const bar   = document.getElementById('chatImgPreviewBar');
    const thumb = document.getElementById('chatImgPreviewThumb');
    const name  = document.getElementById('chatImgPreviewName');
    thumb.src        = e.target.result;
    name.textContent = file.name;
    bar.style.display = 'flex';
  };
  reader.readAsDataURL(file);
  input.value = '';
}

function cancelImagePreview() {
  _pendingImageFile = null;
  document.getElementById('chatImgPreviewBar').style.display = 'none';
}

// ===== KIRIM DARI WIDGET =====
function sendChatFromWidget() {
  // Kalau ada foto pending, kirim foto dulu
  if (_pendingImageFile) {
    sendUserImage(_pendingImageFile);
    _pendingImageFile = null;
    document.getElementById('chatImgPreviewBar').style.display = 'none';
  }
  // Kalau ada teks, kirim teks
  const input = document.getElementById('chatInput');
  if (input && input.value.trim()) {
    sendUserMessage(input.value);
    input.value = '';
  }
  document.getElementById('chatInput')?.focus();
}

// ===== TOGGLE ANIMASI =====
window.toggleChat = function() {
  const widget = document.getElementById('chatWidget');
  const icon   = document.getElementById('chatBubbleIcon');
  if (!widget) return;
  const isOpen = widget.classList.contains('open');
  if (isOpen) {
    widget.style.opacity       = '0';
    widget.style.transform     = 'translateY(20px) scale(0.95)';
    widget.style.pointerEvents = 'none';
    widget.classList.remove('open');
    icon.className = 'fas fa-comment-dots';
    stopChatPolling();
  } else {
    widget.style.opacity       = '1';
    widget.style.transform     = 'translateY(0) scale(1)';
    widget.style.pointerEvents = 'all';
    widget.classList.add('open');
    icon.className = 'fas fa-times';
    // Load pesan dari API saat buka
    fetchChatMessages().then(() => {
      renderChatMessages();
      markAdminMessagesRead();
    });
    startChatPolling();
    setTimeout(() => document.getElementById('chatInput')?.focus(), 200);
  }
};

// ===== EXPOSE =====
window.openChatWidget = function() {
  const widget = document.getElementById('chatWidget');
  if (widget && !widget.classList.contains('open')) window.toggleChat();
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', initChatWidget);
