# Cnailist Backend API

Backend Node.js + Express + MySQL untuk toko kuku palsu Cnailist.

## Cara Menjalankan

### 1. Install dependencies
```bash
cd cnailist-backend
npm install
```

### 2. Setup database
- Buka MySQL (XAMPP / MySQL Workbench)
- Jalankan file `database.sql`
```bash
mysql -u root -p < database.sql
```

### 3. Konfigurasi `.env`
Edit file `.env` sesuai konfigurasi MySQL kamu:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=        # isi password MySQL kamu
DB_NAME=cnailist_db
```

### 4. Jalankan server
```bash
npm run dev     # development (auto-restart)
npm start       # production
```

Server berjalan di: `http://localhost:5000`

---

## Endpoint API

### Auth
| Method | Endpoint | Akses | Keterangan |
|--------|----------|-------|------------|
| POST | `/api/auth/login` | Publik | Login admin |
| GET | `/api/auth/me` | Admin | Info admin login |
| PUT | `/api/auth/change-password` | Admin | Ganti password |

### Produk
| Method | Endpoint | Akses | Keterangan |
|--------|----------|-------|------------|
| GET | `/api/products` | Publik | Semua produk (filter: category, status, search, sort) |
| GET | `/api/products/:id` | Publik | Detail produk |
| POST | `/api/products` | Admin | Tambah produk (form-data + image) |
| PUT | `/api/products/:id` | Admin | Edit produk |
| DELETE | `/api/products/:id` | Admin | Hapus produk |

### Pesanan
| Method | Endpoint | Akses | Keterangan |
|--------|----------|-------|------------|
| GET | `/api/orders/stats` | Admin | Statistik dashboard |
| GET | `/api/orders` | Admin | Semua pesanan |
| GET | `/api/orders/:id` | Admin | Detail pesanan |
| POST | `/api/orders` | Publik | Buat pesanan baru (form-data + proof) |
| PUT | `/api/orders/:id/status` | Admin | Update status |
| DELETE | `/api/orders/:id` | Admin | Hapus pesanan |

### Custom Order
| Method | Endpoint | Akses | Keterangan |
|--------|----------|-------|------------|
| GET | `/api/custom-orders` | Admin | Semua custom order |
| GET | `/api/custom-orders/:id` | Admin | Detail custom order |
| POST | `/api/custom-orders` | Publik | Kirim request custom (form-data + images) |
| PUT | `/api/custom-orders/:id/status` | Admin | Update status |
| DELETE | `/api/custom-orders/:id` | Admin | Hapus |

### Chat
| Method | Endpoint | Akses | Keterangan |
|--------|----------|-------|------------|
| GET | `/api/chat/sessions` | Admin | Semua sesi chat |
| GET | `/api/chat/unread-count` | Admin | Jumlah pesan belum dibaca |
| GET | `/api/chat/:sessionId` | Publik | Pesan satu sesi |
| POST | `/api/chat` | Publik | Kirim pesan/foto (form-data) |
| POST | `/api/chat/:sessionId/reply` | Admin | Balas pesan/foto |
| PUT | `/api/chat/:sessionId/read` | Admin | Tandai sudah dibaca |
| DELETE | `/api/chat/:sessionId` | Admin | Hapus sesi |

### Pelanggan
| Method | Endpoint | Akses | Keterangan |
|--------|----------|-------|------------|
| GET | `/api/customers` | Admin | Semua pelanggan |
| GET | `/api/customers/:id` | Admin | Detail + riwayat pesanan |
| POST | `/api/customers/register` | Publik | Daftar akun |
| PUT | `/api/customers/:id/status` | Admin | Aktif/nonaktif |
| DELETE | `/api/customers/:id` | Admin | Hapus |

---

## Autentikasi Admin

Semua endpoint admin butuh header:
```
Authorization: Bearer <token>
```

Token didapat dari `POST /api/auth/login`.

**Akun default:**
- Email: `admin@cnailist.id`
- Password: `admin123`
