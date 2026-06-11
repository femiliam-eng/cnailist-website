// ===== CNAILIST API CLIENT =====
// Backend: Laravel pada port 8000
const API_BASE    = 'http://localhost:8000/api';
const STORAGE_URL = 'http://localhost:8000/storage';

// ===== AUTH TOKEN =====
function getToken() {
  return localStorage.getItem('cnailist_admin_token');
}

function setToken(token) {
  localStorage.setItem('cnailist_admin_token', token);
}

function clearToken() {
  localStorage.removeItem('cnailist_admin_token');
  localStorage.removeItem('cnailist_admin_info');
}

// ===== BASE FETCH =====
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  // Jangan set Content-Type kalau FormData (biar browser yang set boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  const res = await fetch(API_BASE + path, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || 'Request gagal');
    err.status = res.status;
    err.data   = data;
    throw err;
  }

  return data;
}

// ===== AUTH =====
const authAPI = {
  login: (email, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => apiFetch('/auth/me'),
};

// ===== PRODUK =====
const productAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch('/products' + (qs ? '?' + qs : ''));
  },

  getOne: (id) => apiFetch('/products/' + id),

  // Laravel: gunakan POST untuk update (multipart support lebih baik)
  create: (formData) =>
    apiFetch('/products', { method: 'POST', body: formData }),

  update: (id, formData) =>
    apiFetch('/products/' + id, { method: 'POST', body: formData }),

  remove: (id) =>
    apiFetch('/products/' + id, { method: 'DELETE' }),

  // Helper: resolve URL gambar produk (image_url dari API atau fallback)
  imageUrl: (product) => {
    if (!product) return 'images/nail-1.jpeg';
    if (product.image_url) return product.image_url;
    if (!product.image)    return 'images/nail-1.jpeg';
    if (product.image.startsWith('http')) return product.image;
    return STORAGE_URL + '/products/' + product.image;
  },
};

// ===== PESANAN =====
const orderAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch('/orders' + (qs ? '?' + qs : ''));
  },

  getOne: (id)   => apiFetch('/orders/' + id),
  getStats: ()   => apiFetch('/orders/stats'),

  create: (formData) =>
    apiFetch('/orders', { method: 'POST', body: formData }),

  updateStatus: (id, status) =>
    apiFetch('/orders/' + id + '/status', {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  remove: (id) =>
    apiFetch('/orders/' + id, { method: 'DELETE' }),
};

// ===== CUSTOM ORDER =====
const customOrderAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch('/custom-orders' + (qs ? '?' + qs : ''));
  },

  getOne: (id) => apiFetch('/custom-orders/' + id),

  create: (formData) =>
    apiFetch('/custom-orders', { method: 'POST', body: formData }),

  updateStatus: (id, status) =>
    apiFetch('/custom-orders/' + id + '/status', {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  remove: (id) =>
    apiFetch('/custom-orders/' + id, { method: 'DELETE' }),
};

// ===== CHAT =====
const chatAPI = {
  getSessions:  () => apiFetch('/chat/sessions'),
  getUnread:    () => apiFetch('/chat/unread-count'),
  getMessages:  (sessionId) => apiFetch('/chat/' + sessionId),

  sendMessage: (formData) =>
    apiFetch('/chat', { method: 'POST', body: formData }),

  reply: (sessionId, formData) =>
    apiFetch('/chat/' + sessionId + '/reply', { method: 'POST', body: formData }),

  markRead: (sessionId) =>
    apiFetch('/chat/' + sessionId + '/read', { method: 'PUT' }),

  deleteSession: (sessionId) =>
    apiFetch('/chat/' + sessionId, { method: 'DELETE' }),
};

// ===== PELANGGAN =====
const customerAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch('/customers' + (qs ? '?' + qs : ''));
  },

  // Identifier adalah no. HP (bukan ID)
  getOne: (phone) => apiFetch('/customers/' + encodeURIComponent(phone)),
  remove: (phone) => apiFetch('/customers/' + encodeURIComponent(phone), { method: 'DELETE' }),

  // Tracking pesanan publik (tanpa auth)
  track: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(API_BASE + '/orders/track' + (qs ? '?' + qs : ''));
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || 'Tidak ditemukan');
      err.status = res.status;
      throw err;
    }
    return data;
  },
};

// ===== UTILS =====
// Cek apakah admin sudah login (ada token)
function isAdminLoggedIn() {
  return !!getToken();
}

// Redirect ke login kalau belum auth (untuk halaman admin)
function requireAdminAuth() {
  if (!isAdminLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Set info admin di UI (nama, role)
function setAdminUIInfo() {
  const info = JSON.parse(localStorage.getItem('cnailist_admin_info') || '{}');
  if (!info.name) return;
  const nameEls = document.querySelectorAll('.admin-name');
  const roleEls = document.querySelectorAll('.admin-role');
  const avatarEls = document.querySelectorAll('.admin-avatar');
  nameEls.forEach(el => el.textContent = info.name);
  roleEls.forEach(el => el.textContent = (info.role === 'superadmin' || info.role === 'super_admin') ? 'Super Admin' : 'Admin');
  avatarEls.forEach(el => el.textContent = info.name.charAt(0).toUpperCase());
}

// Handle logout
function adminLogout() {
  clearToken();
  window.location.href = 'login.html';
}
