const { getDb } = require('../database/db')

function getAll() {
  const db = getDb()
  return db.prepare('SELECT * FROM categories ORDER BY name').all()
}

function create(data) {
  const db = getDb()
  const result = db.prepare('INSERT INTO categories (name, color) VALUES (?, ?)').run(data.name, data.color || '#6366f1')
  return db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid)
}

function update(id, data) {
  const db = getDb()
  const fields = []
  const values = []
  if (data.name  !== undefined) { fields.push('name = ?');  values.push(data.name) }
  if (data.color !== undefined) { fields.push('color = ?'); values.push(data.color) }
  values.push(id)
  db.prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  return db.prepare('SELECT * FROM categories WHERE id = ?').get(id)
}

function remove(id) {
  const db = getDb()
  // Set category_id to null for affected products
  db.prepare('UPDATE products SET category_id = NULL WHERE category_id = ?').run(id)
  db.prepare('DELETE FROM categories WHERE id = ?').run(id)
  return { success: true }
}

module.exports = { getAll, create, update, remove }
