// ===== SHARED DATA =====
// Data produk, pesanan, pelanggan sekarang diambil dari API (database)
// Array ini hanya sebagai fallback kosong — jangan isi data statis di sini
const adminProducts = [];
const adminOrders   = [];
const adminCustomers = [];

// ===== UTILS =====
function formatRp(n) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

function formatDate(d) {
  const date = new Date(d);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function showToast(msg, type = 'pink') {
  let toast = document.getElementById('adminToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'adminToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.className = `toast toast-${type} show`;
  toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'bell'}"></i> ${msg}`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function openModal(id) {
  document.getElementById(id)?.classList.add('active');
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('active');
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

// ===== SIDEBAR TOGGLE =====
function toggleSidebar() {
  const sidebar = document.getElementById('adminSidebar');
  const main = document.getElementById('mainContent');
  sidebar.classList.toggle('collapsed');
  main.classList.toggle('expanded');
}

// ===== STATUS BADGE =====
function statusBadge(status) {
  const map = {
    'Aktif':      'badge-success',
    'Nonaktif':   'badge-gray',
    'Habis':      'badge-danger',
    'Selesai':    'badge-success',
    'Dikirim':    'badge-info',
    'Diproses':   'badge-warning',
    'Pending':    'badge-pink',
    'Dibatalkan': 'badge-danger',
  };
  return `<span class="badge ${map[status] || 'badge-gray'}">${status}</span>`;
}

// ===== CONFIRM DELETE =====
function confirmDelete(msg, onConfirm) {
  const modal = document.getElementById('confirmModal');
  if (!modal) return;
  document.getElementById('confirmMsg').textContent = msg;
  document.getElementById('confirmOkBtn').onclick = () => {
    onConfirm();
    closeModal('confirmModal');
  };
  openModal('confirmModal');
}
