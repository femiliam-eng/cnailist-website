-- ============================================================
--  CNAILIST DATABASE
--  Import ke MySQL: mysql -u root -p cnailist_db < database.sql
--  Atau import via phpMyAdmin / Laragon / XAMPP
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS cnailist_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cnailist_db;

-- ============================================================
--  1. ADMINS
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)    NOT NULL,
  email      VARCHAR(150)    NOT NULL UNIQUE,
  password   VARCHAR(255)    NOT NULL,   -- bcrypt
  role       VARCHAR(50)     NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin default: email=admin@cnailist.id  password=admin123
INSERT INTO admins (name, email, password, role) VALUES
('Cnailist Admin', 'admin@cnailist.id',
 '$2y$12$TKh8H1.PfYi8t85YnNNVDuOsQnCq5XoNKFoJ6kd5.5hOFSmyFHnP6',
 'superadmin')
ON DUPLICATE KEY UPDATE id = id;

-- ============================================================
--  2. SANCTUM TOKENS  (dipakai Laravel Sanctum)
-- ============================================================
CREATE TABLE IF NOT EXISTS personal_access_tokens (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tokenable_type VARCHAR(255)    NOT NULL,
  tokenable_id   BIGINT UNSIGNED NOT NULL,
  name           VARCHAR(255)    NOT NULL,
  token          VARCHAR(64)     NOT NULL UNIQUE,
  abilities      TEXT            NULL,
  last_used_at   TIMESTAMP       NULL,
  expires_at     TIMESTAMP       NULL,
  created_at     TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tokenable (tokenable_type, tokenable_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  3. CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)    NOT NULL,
  email      VARCHAR(150)    NOT NULL UNIQUE,
  password   VARCHAR(255)    NOT NULL,   -- bcrypt
  phone      VARCHAR(20)     NULL,
  address    TEXT            NULL,
  status     VARCHAR(20)     NOT NULL DEFAULT 'Aktif',
  created_at TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  4. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150)    NOT NULL,
  description TEXT            NULL,
  price       BIGINT          NOT NULL DEFAULT 0,
  stock       INT             NOT NULL DEFAULT 0,
  category    VARCHAR(50)     NULL,
  image       VARCHAR(255)    NULL,   -- filename saja, URL dibangun dari storage
  status      VARCHAR(20)     NOT NULL DEFAULT 'Aktif',   -- Aktif | Nonaktif | Habis
  created_at  TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12 produk default
INSERT INTO products (name, description, price, stock, category, image, status) VALUES
('Glam Pink Nails',     'Set kuku palsu warna pink glamour dengan variasi glitter, cocok untuk tampilan elegan dan feminin.',  75000, 42, 'Glamour',   NULL, 'Aktif'),
('Modern Nude Set',     'Set kuku palsu warna nude modern yang elegan. Cocok untuk berbagai kesempatan formal maupun kasual.', 75000, 28, 'Elegan',    NULL, 'Aktif'),
('Sparkle Blue Nails',  'Set kuku palsu biru berkilau dengan aksen sparkle yang memukau. Tampil beda dan percaya diri.',       75000, 15, 'Glamour',   NULL, 'Aktif'),
('Classic French Tips', 'French tips klasik yang timeless. Cocok untuk tampilan profesional dan elegan sehari-hari.',          75000,  0, 'Minimalis', NULL, 'Habis'),
('Floral Art Nails',    'Kuku palsu dengan motif bunga yang cantik dan detail. Sempurna untuk acara spesial.',                 75000, 33, 'Elegan',    NULL, 'Aktif'),
('Chic Black Nails',    'Kuku palsu hitam chic yang bold dan stylish. Untuk tampilan yang berani dan modern.',                  75000,  7, 'Glamour',   NULL, 'Aktif'),
('Pastel Dream Set',    'Set kuku palsu pastel yang lembut dan dreamy. Cocok untuk tampilan cute dan feminin.',                 75000, 20, 'Minimalis', NULL, 'Aktif'),
('Rose Gold Glam',      'Kuku palsu rose gold yang mewah dan glamour. Tampil memukau di setiap kesempatan.',                   75000,  0, 'Glamour',   NULL, 'Nonaktif'),
('Ombre Pink Set',      'Set kuku palsu ombre pink yang gradasi indah. Tampilan modern dan trendi.',                           75000, 18, 'Elegan',    NULL, 'Aktif'),
('Crystal Clear Nails', 'Kuku palsu transparan dengan aksen kristal yang elegan. Minimalis namun tetap memukau.',              75000, 25, 'Minimalis', NULL, 'Aktif'),
('Vintage Lace Nails',  'Kuku palsu dengan motif renda vintage yang anggun. Sempurna untuk acara pernikahan.',                 75000, 11, 'Elegan',    NULL, 'Aktif'),
('Neon Pop Nails',      'Kuku palsu neon yang cerah dan eye-catching. Untuk tampilan yang fun dan energik.',                   75000,  5, 'Glamour',   NULL, 'Aktif')
ON DUPLICATE KEY UPDATE id = id;

-- ============================================================
--  5. ORDERS  (pesanan dari customer)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id                VARCHAR(20)  NOT NULL PRIMARY KEY,   -- format: ORD-XXXXXXXX
  customer_name     VARCHAR(100) NOT NULL,
  customer_phone    VARCHAR(20)  NOT NULL,
  customer_address  TEXT         NOT NULL,
  payment_method    VARCHAR(50)  NOT NULL,               -- seabank | gopay
  payment_proof     VARCHAR(255) NULL,                   -- filename bukti bayar
  subtotal          BIGINT       NOT NULL DEFAULT 0,
  shipping_cost     BIGINT       NOT NULL DEFAULT 15000,
  total             BIGINT       NOT NULL DEFAULT 0,
  notes             TEXT         NULL,
  status            VARCHAR(20)  NOT NULL DEFAULT 'Pending',
  -- Pending | Diproses | Dikirim | Selesai | Dibatalkan
  created_at        TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  6. ORDER ITEMS  (detail produk per pesanan)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id   VARCHAR(20)     NOT NULL,
  product_id BIGINT UNSIGNED NULL,
  name       VARCHAR(150)    NOT NULL,
  price      BIGINT          NOT NULL,
  qty        INT             NOT NULL DEFAULT 1,
  created_at TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_oi_order   FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  CONSTRAINT fk_oi_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  7. CUSTOM ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS custom_orders (
  id          VARCHAR(20)  NOT NULL PRIMARY KEY,   -- format: REQ-XXXXXXXX
  name        VARCHAR(100) NOT NULL,
  phone       VARCHAR(20)  NOT NULL,
  design_desc TEXT         NOT NULL,
  nail_size   VARCHAR(10)  NULL,
  qty         INT          NOT NULL DEFAULT 1,
  deadline    DATE         NULL,
  budget      VARCHAR(50)  NULL,
  notes       TEXT         NULL,
  status      VARCHAR(20)  NOT NULL DEFAULT 'Pending',
  -- Pending | Diproses | Selesai | Dibatalkan
  created_at  TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  8. CUSTOM ORDER IMAGES  (gambar referensi)
-- ============================================================
CREATE TABLE IF NOT EXISTS custom_order_images (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  custom_order_id VARCHAR(20)     NOT NULL,
  image_path      VARCHAR(255)    NOT NULL,
  created_at      TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_coi_co FOREIGN KEY (custom_order_id) REFERENCES custom_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  9. CHATS
-- ============================================================
CREATE TABLE IF NOT EXISTS chats (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  session_id   VARCHAR(100)    NOT NULL,
  sender_name  VARCHAR(100)    NOT NULL DEFAULT 'Tamu',
  `from`       VARCHAR(10)     NOT NULL,   -- user | admin
  type         VARCHAR(10)     NOT NULL DEFAULT 'text',   -- text | image
  message      TEXT            NULL,
  image_path   VARCHAR(255)    NULL,
  is_read      TINYINT(1)      NOT NULL DEFAULT 0,
  created_at   TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_session (session_id),
  INDEX idx_unread  (`from`, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  10. TABEL LARAVEL WAJIB
--  (sessions, cache, jobs, migrations, password_reset_tokens)
-- ============================================================
CREATE TABLE IF NOT EXISTS migrations (
  id        INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  migration VARCHAR(255) NOT NULL,
  batch     INT          NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  id            VARCHAR(255)    NOT NULL PRIMARY KEY,
  user_id       BIGINT UNSIGNED NULL,
  ip_address    VARCHAR(45)     NULL,
  user_agent    TEXT            NULL,
  payload       LONGTEXT        NOT NULL,
  last_activity INT             NOT NULL,
  INDEX idx_user_id     (user_id),
  INDEX idx_last_activity (last_activity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cache (
  `key`        VARCHAR(255) NOT NULL PRIMARY KEY,
  value        MEDIUMTEXT   NOT NULL,
  expiration   INT          NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cache_locks (
  `key`       VARCHAR(255) NOT NULL PRIMARY KEY,
  owner       VARCHAR(255) NOT NULL,
  expiration  INT          NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS jobs (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  queue        VARCHAR(255)    NOT NULL,
  payload      LONGTEXT        NOT NULL,
  attempts     TINYINT UNSIGNED NOT NULL,
  reserved_at  INT UNSIGNED    NULL,
  available_at INT UNSIGNED    NOT NULL,
  created_at   INT UNSIGNED    NOT NULL,
  INDEX idx_queue (queue)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS job_batches (
  id             VARCHAR(255) NOT NULL PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  total_jobs     INT          NOT NULL,
  pending_jobs   INT          NOT NULL,
  failed_jobs    INT          NOT NULL,
  failed_job_ids LONGTEXT     NOT NULL,
  options        MEDIUMTEXT   NULL,
  cancelled_at   INT          NULL,
  created_at     INT          NOT NULL,
  finished_at    INT          NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS failed_jobs (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  uuid       VARCHAR(255)    NOT NULL UNIQUE,
  connection TEXT            NOT NULL,
  queue      TEXT            NOT NULL,
  payload    LONGTEXT        NOT NULL,
  exception  LONGTEXT        NOT NULL,
  failed_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  email      VARCHAR(255) NOT NULL PRIMARY KEY,
  token      VARCHAR(255) NOT NULL,
  created_at TIMESTAMP    NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(255)    NOT NULL,
  email             VARCHAR(255)    NOT NULL UNIQUE,
  email_verified_at TIMESTAMP       NULL,
  password          VARCHAR(255)    NOT NULL,
  remember_token    VARCHAR(100)    NULL,
  created_at        TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
--  SELESAI
--  Cara import:
--    mysql -u root -p < database.sql
--  Atau buka phpMyAdmin → pilih database → Import → pilih file ini
-- ============================================================
