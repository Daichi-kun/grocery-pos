PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA synchronous = NORMAL;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT    NOT NULL UNIQUE,
  password   TEXT    NOT NULL,
  full_name  TEXT    NOT NULL,
  role       TEXT    NOT NULL CHECK(role IN ('admin', 'cashier')),
  is_active  INTEGER NOT NULL DEFAULT 1,
  created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL UNIQUE,
  color      TEXT    NOT NULL DEFAULT '#6366f1',
  created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  barcode             TEXT    UNIQUE,
  name                TEXT    NOT NULL,
  category_id         INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  price               REAL    NOT NULL CHECK(price >= 0),
  cost                REAL    NOT NULL DEFAULT 0 CHECK(cost >= 0),
  stock               REAL    NOT NULL DEFAULT 0,
  unit                TEXT    NOT NULL DEFAULT 'pcs' CHECK(unit IN ('pcs','kg','g','l','ml')),
  low_stock_threshold REAL    NOT NULL DEFAULT 5,
  is_active           INTEGER NOT NULL DEFAULT 1,
  created_at          TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at          TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_products_barcode  ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active   ON products(is_active);

-- Sales
CREATE TABLE IF NOT EXISTS sales (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_number     TEXT    NOT NULL UNIQUE,
  user_id         INTEGER NOT NULL REFERENCES users(id),
  subtotal        REAL    NOT NULL,
  discount_amount REAL    NOT NULL DEFAULT 0,
  total           REAL    NOT NULL,
  payment_method  TEXT    NOT NULL DEFAULT 'cash' CHECK(payment_method IN ('cash','card')),
  cash_given      REAL,
  change_given    REAL,
  status          TEXT    NOT NULL DEFAULT 'completed' CHECK(status IN ('completed','voided','returned')),
  notes           TEXT,
  created_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_status     ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_user       ON sales(user_id);

-- Sale items (price snapshot)
CREATE TABLE IF NOT EXISTS sale_items (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id         INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id      INTEGER NOT NULL REFERENCES products(id),
  product_name    TEXT    NOT NULL,
  product_barcode TEXT,
  unit_price      REAL    NOT NULL,
  unit_cost       REAL    NOT NULL DEFAULT 0,
  quantity        REAL    NOT NULL,
  discount_amount REAL    NOT NULL DEFAULT 0,
  line_total      REAL    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale    ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id);

-- Purchases
CREATE TABLE IF NOT EXISTS purchases (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  reference     TEXT,
  supplier_name TEXT,
  user_id       INTEGER NOT NULL REFERENCES users(id),
  total_cost    REAL    NOT NULL DEFAULT 0,
  notes         TEXT,
  created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS purchase_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id),
  quantity    REAL    NOT NULL,
  unit_cost   REAL    NOT NULL DEFAULT 0,
  line_total  REAL    NOT NULL
);

-- Returns
CREATE TABLE IF NOT EXISTS returns (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id       INTEGER NOT NULL REFERENCES sales(id),
  user_id       INTEGER NOT NULL REFERENCES users(id),
  reason        TEXT,
  refund_amount REAL    NOT NULL,
  created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS return_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  return_id    INTEGER NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
  sale_item_id INTEGER NOT NULL REFERENCES sale_items(id),
  product_id   INTEGER NOT NULL REFERENCES products(id),
  quantity     REAL    NOT NULL,
  refund_line  REAL    NOT NULL
);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO settings (key, value) VALUES
  ('store_name',     'Продуктовый магазин'),
  ('currency',       'RUB'),
  ('currency_sym',   '₽'),
  ('tax_rate',       '0'),
  ('receipt_footer', 'Спасибо за покупку!'),
  ('low_stock_alert','1'),
  ('theme',          'light');
