import Database from 'better-sqlite3'

let db: Database.Database | null = null

export function initDb(dbPath?: string): Database.Database {
  const path = dbPath || process.env.DATABASE_URL || './restaurant.db'
  
  db = new Database(path)
  db.pragma('journal_mode = WAL')
  
  createTables(db)
  createIndexes(db)
  
  return db
}

export function getDb(): Database.Database {
  if (!db) {
    return initDb()
  }
  return db
}

function createTables(database: Database.Database): void {
  // Categories table
  database.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_en TEXT,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Menu items table
  database.exec(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      name_en TEXT,
      description TEXT,
      description_en TEXT,
      price INTEGER NOT NULL,
      image_url TEXT,
      is_available INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `)

  // Orders table
  database.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      table_number TEXT,
      order_type TEXT NOT NULL DEFAULT 'dine_in',
      status TEXT NOT NULL DEFAULT 'pending',
      subtotal INTEGER NOT NULL,
      tax INTEGER NOT NULL,
      total INTEGER NOT NULL,
      customer_id INTEGER,
      notes TEXT,
      source TEXT DEFAULT 'pos',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `)

  // Order items table
  database.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      menu_item_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price INTEGER NOT NULL,
      subtotal INTEGER NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
    )
  `)

  // Customers table
  database.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      phone TEXT,
      email TEXT,
      loyalty_points INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Coupons table
  database.exec(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      discount_type TEXT NOT NULL,
      discount_value INTEGER NOT NULL,
      min_order_amount INTEGER,
      valid_from DATETIME,
      valid_until DATETIME,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

function createIndexes(database: Database.Database): void {
  database.exec(`CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id)`)
  database.exec(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`)
  database.exec(`CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at)`)
  database.exec(`CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`)
  database.exec(`CREATE INDEX IF NOT EXISTS idx_order_items_menu ON order_items(menu_item_id)`)
}

export default { initDb, getDb }
