const fs = require('fs')
const path = require('path')
const { getDb } = require('./db')
const bcrypt = require('bcryptjs')

function runMigrations() {
  const db = getDb()

  // Run schema
  const schemaPath = path.join(__dirname, 'schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf8')
  db.exec(schema)

  // Seed default admin if no users exist
  const userCount = db.prepare('SELECT COUNT(*) as cnt FROM users').get()
  if (userCount.cnt === 0) {
    const hash = bcrypt.hashSync('admin123', 10)
    db.prepare(
      `INSERT INTO users (username, password, full_name, role)
       VALUES ('admin', ?, 'Администратор', 'admin')`
    ).run(hash)

    const cashierHash = bcrypt.hashSync('cashier123', 10)
    db.prepare(
      `INSERT INTO users (username, password, full_name, role)
       VALUES ('cashier', ?, 'Кассир', 'cashier')`
    ).run(cashierHash)
  }

  // Seed demo categories if empty
  const catCount = db.prepare('SELECT COUNT(*) as cnt FROM categories').get()
  if (catCount.cnt === 0) {
    const cats = [
      { name: 'Молочные продукты',  color: '#3b82f6' },
      { name: 'Хлеб и выпечка',    color: '#f59e0b' },
      { name: 'Мясо и птица',      color: '#ef4444' },
      { name: 'Фрукты и овощи',    color: '#22c55e' },
      { name: 'Напитки',           color: '#8b5cf6' },
      { name: 'Бакалея',           color: '#6366f1' },
      { name: 'Кондитерские',      color: '#ec4899' },
      { name: 'Замороженные',      color: '#06b6d4' },
    ]
    const insertCat = db.prepare('INSERT INTO categories (name, color) VALUES (?, ?)')
    cats.forEach(c => insertCat.run(c.name, c.color))
  }

  console.log('Migrations completed successfully')
}

module.exports = { runMigrations }
