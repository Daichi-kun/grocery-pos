const { getDb } = require('../database/db')
const { hashPassword, verifyPassword } = require('../utils/auth')

function getAll() {
  const db = getDb()
  return db.prepare(
    'SELECT id, username, full_name, role, is_active, created_at FROM users ORDER BY id'
  ).all()
}

function getByUsername(username) {
  const db = getDb()
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username)
}

function create(data) {
  const db = getDb()
  const hash = hashPassword(data.password)
  const result = db.prepare(
    `INSERT INTO users (username, password, full_name, role, is_active)
     VALUES (?, ?, ?, ?, 1)`
  ).run(data.username, hash, data.full_name, data.role)
  return { id: result.lastInsertRowid, ...data, password: undefined }
}

function update(id, data) {
  const db = getDb()
  const fields = []
  const values = []

  if (data.full_name !== undefined) { fields.push('full_name = ?'); values.push(data.full_name) }
  if (data.role !== undefined)      { fields.push('role = ?');      values.push(data.role) }
  if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active ? 1 : 0) }
  if (data.password)                { fields.push('password = ?'); values.push(hashPassword(data.password)) }

  fields.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')")
  values.push(id)

  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  const user = db.prepare('SELECT id, username, full_name, role, is_active FROM users WHERE id = ?').get(id)
  return user
}

function remove(id) {
  const db = getDb()
  const adminCount = db.prepare("SELECT COUNT(*) as cnt FROM users WHERE role='admin' AND is_active=1").get()
  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(id)
  if (user && user.role === 'admin' && adminCount.cnt <= 1) {
    throw new Error('Нельзя удалить последнего администратора')
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(id)
  return { success: true }
}

function login(username, password) {
  const user = getByUsername(username)
  if (!user || !user.is_active) return null
  if (!verifyPassword(password, user.password)) return null
  const { password: _, ...safeUser } = user
  return safeUser
}

module.exports = { getAll, getByUsername, create, update, remove, login }
