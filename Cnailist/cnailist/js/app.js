// ===== DATA PRODUK STATIS (fallback kalau API tidak tersedia) =====
const STATIC_PRODUCTS = [
  {
    id: 1,
    name: "Glam Pink Nails",
    price: 75000,
    category: "Glamour",
    image: "images/nail-1.jpeg",
    images: ["images/nail-1.jpeg", "images/nail-2.jpeg", "images/nail-hero.jpeg"],
    description: "Set kuku palsu warna pink glamour dengan variasi glitter, cocok untuk tampilan elegan dan feminin. Mudah dipasang dan nyaman digunakan.",
    stock: 42,
    status: "Aktif"
  },
  {
    id: 2,
    name: "Modern Nude Set",
    price: 75000,
    category: "Elegan",
    image: "images/nail-2.jpeg",
    images: ["images/nail-2.jpeg", "images/nail-3.jpeg", "images/nail-4.jpeg"],
    description: "Set kuku palsu warna nude modern yang elegan. Cocok untuk berbagai kesempatan formal maupun kasual.",
    stock: 28,
    status: "Aktif"
  },
  {
    id: 3,
    name: "Sparkle Blue Nails",
    price: 75000,
    category: "Glamour",
    image: "images/nail-3.jpeg",
    images: ["images/nail-3.jpeg", "images/nail-4.jpeg", "images/nail-5.jpeg"],
    description: "Set kuku palsu biru berkilau dengan aksen sparkle yang memukau. Tampil beda dan percaya diri.",
    stock: 15,
    status: "Aktif"
  },
  {
    id: 4,
    name: "Classic French Tips",
    price: 75000,
    category: "Minimalis",
    image: "images/nail-4.jpeg",
    images: ["images/nail-4.jpeg", "images/nail-5.jpeg", "images/nail-6.jpeg"],
    description: "French tips klasik yang timeless. Cocok untuk tampilan profesional dan elegan sehari-hari.",
    stock: 0,
    status: "Habis"
  },
  {
    id: 5,
    name: "Floral Art Nails",
    price: 75000,
    category: "Elegan",
    image: "images/nail-5.jpeg",
    images: ["images/nail-5.jpeg", "images/nail-6.jpeg", "images/nail-7.jpeg"],
    description: "Kuku palsu dengan motif bunga yang cantik dan detail. Sempurna untuk acara spesial.",
    stock: 33,
    status: "Aktif"
  },
  {
    id: 6,
    name: "Chic Black Nails",
    price: 75000,
    category: "Glamour",
    image: "images/nail-6.jpeg",
    images: ["images/nail-6.jpeg", "images/nail-7.jpeg", "images/nail-8.jpeg"],
    description: "Kuku palsu hitam chic yang bold dan stylish. Untuk tampilan yang berani dan modern.",
    stock: 7,
    status: "Aktif"
  },
  {
    id: 7,
    name: "Pastel Dream Set",
    price: 75000,
    category: "Minimalis",
    image: "images/nail-7.jpeg",
    images: ["images/nail-7.jpeg", "images/nail-8.jpeg", "images/nail-9.jpeg"],
    description: "Set kuku palsu pastel yang lembut dan dreamy. Cocok untuk tampilan cute dan feminin.",
    stock: 20,
    status: "Aktif"
  },
  {
    id: 8,
    name: "Rose Gold Glam",
    price: 75000,
    category: "Glamour",
    image: "images/nail-8.jpeg",
    images: ["images/nail-8.jpeg", "images/nail-9.jpeg", "images/nail-10.jpeg"],
    description: "Kuku palsu rose gold yang mewah dan glamour. Tampil memukau di setiap kesempatan.",
    stock: 0,
    status: "Nonaktif"
  },
  {
    id: 9,
    name: "Ombre Pink Set",
    price: 75000,
    category: "Elegan",
    image: "images/nail-9.jpeg",
    images: ["images/nail-9.jpeg", "images/nail-10.jpeg", "images/nail-11.jpeg"],
    description: "Set kuku palsu ombre pink yang gradasi indah. Tampilan modern dan trendi.",
    stock: 18,
    status: "Aktif"
  },
  {
    id: 10,
    name: "Crystal Clear Nails",
    price: 75000,
    category: "Minimalis",
    image: "images/nail-10.jpeg",
    images: ["images/nail-10.jpeg", "images/nail-11.jpeg", "images/nail-12.jpeg"],
    description: "Kuku palsu transparan dengan aksen kristal yang elegan. Minimalis namun tetap memukau.",
    stock: 25,
    status: "Aktif"
  },
  {
    id: 11,
    name: "Vintage Lace Nails",
    price: 75000,
    category: "Elegan",
    image: "images/nail-11.jpeg",
    images: ["images/nail-11.jpeg", "images/nail-12.jpeg", "images/nail-1.jpeg"],
    description: "Kuku palsu dengan motif renda vintage yang anggun. Sempurna untuk acara pernikahan.",
    stock: 11,
    status: "Aktif"
  },
  {
    id: 12,
    name: "Neon Pop Nails",
    price: 75000,
    category: "Glamour",
    image: "images/nail-12.jpeg",
    images: ["images/nail-12.jpeg", "images/nail-1.jpeg", "images/nail-2.jpeg"],
    description: "Kuku palsu neon yang cerah dan eye-catching. Untuk tampilan yang fun dan energik.",
    stock: 5,
    status: "Aktif"
  }
];

// ===== PRODUK AKTIF (yang tampil ke customer) =====
// Akan di-replace oleh data dari API saat load
let products = STATIC_PRODUCTS.filter(p => p.status === 'Aktif');

// ===== API BASE URL =====
const _APP_API_BASE  = 'http://localhost:8000/api';
const _APP_STORAGE   = 'http://localhost:8000/storage';

// ===== HELPER: Normalisasi produk dari API =====
function _normalizeProduct(p) {
  // Laravel kirim image_url (full URL), pakai itu kalau ada
  const resolveImg = (product) => {
    if (product.image_url) return product.image_url;
    if (!product.image)    return 'images/nail-1.jpeg';
    if (product.image.startsWith('http') || product.image.startsWith('images/')) return product.image;
    return _APP_STORAGE + '/products/' + product.image;
  };

  return {
    id:          p.id,
    name:        p.name,
    price:       p.price,
    category:    p.category || '',
    image:       resolveImg(p),
    images:      [resolveImg(p)], // single image; merge dengan statis kalau cocok ID
    description: p.description || '',
    stock:       p.stock ?? 0,
    status:      p.status || 'Aktif',
  };
}

// ===== LOAD PRODUK DARI API =====
async function loadProductsFromAPI() {
  // Cek cache di sessionStorage dulu (valid 5 menit)
  const cached = sessionStorage.getItem('cnailist_products_cache');
  if (cached) {
    try {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < 5 * 60 * 1000 && data.length > 0) {
        products = data;
        return true;
      }
    } catch (_) { /* invalid cache */ }
  }

  try {
    const res = await fetch(_APP_API_BASE + '/products?status=Aktif');
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
      products = data.data.map(_normalizeProduct);
      // Simpan ke cache
      sessionStorage.setItem('cnailist_products_cache', JSON.stringify({
        data: products,
        ts: Date.now(),
      }));
      return true;
    }
  } catch (_) {
    // API tidak tersedia, pakai data statis
  }
  products = STATIC_PRODUCTS.filter(p => p.status === 'Aktif');
  return false;
}

// ===== LOAD SATU PRODUK DARI API =====
async function loadProductByIdFromAPI(id) {
  try {
    const res = await fetch(_APP_API_BASE + '/products/' + id);
    if (!res.ok) throw new Error('not found');
    const data = await res.json();
    if (data.success && data.data) {
      const p = _normalizeProduct(data.data);
      // Merge images dari data statis (API hanya simpan 1 gambar per produk)
      const staticP = STATIC_PRODUCTS.find(s => s.id === p.id);
      if (staticP && staticP.images && staticP.images.length > 1) {
        p.images = staticP.images;
      }
      return p;
    }
  } catch (_) { /* fallback */ }
  return STATIC_PRODUCTS.find(p => p.id === id) || STATIC_PRODUCTS[0];
}

// ===== CART STATE =====
let cart = JSON.parse(localStorage.getItem('fnb_cart') || '[]');

function saveCart() {
  localStorage.setItem('fnb_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const total  = cart.reduce((sum, item) => sum + item.qty, 0);
  badges.forEach(b => {
    b.textContent = total;
    b.style.display = total > 0 ? 'flex' : 'none';
  });
}

function addToCart(productId, qty = 1) {
  // Cari di products atau STATIC_PRODUCTS
  const product = products.find(p => p.id === productId)
    || STATIC_PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ ...product, qty });
  }
  saveCart();
  showToast(`${product.name} ditambahkan ke keranjang!`);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
}

function formatPrice(price) {
  return 'Rp ' + Number(price).toLocaleString('id-ID');
}

function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();

  // Close modal on overlay click
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeLoginModal();
    });
  }
});

// ===== NAVIGATE =====
function goTo(page, productId) {
  if (productId !== undefined) {
    localStorage.setItem('fnb_selected_product', productId);
  }
  window.location.href = page;
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
});
