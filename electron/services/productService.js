const { getDb } = require('../database/db')

const BASE_QUERY = `
  SELECT p.*, c.name as category_name, c.color as category_color
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
`

function getAll(filters = {}) {
  const db = getDb()
  let where = []
  let params = []

  if (!filters.includeInactive) {
    where.push('p.is_active = 1')
  }
  if (filters.category_id) {
    where.push('p.category_id = ?')
    params.push(filters.category_id)
  }
  if (filters.search) {
    where.push('(p.name LIKE ? OR p.barcode LIKE ?)')
    params.push(`%${filters.search}%`, `%${filters.search}%`)
  }
  if (filters.lowStock) {
    where.push('p.stock <= p.low_stock_threshold')
  }

  const sql = BASE_QUERY + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY p.name'
  return db.prepare(sql).all(...params)
}

function getByBarcode(barcode) {
  const db = getDb()
  return db.prepare(BASE_QUERY + ' WHERE p.barcode = ? AND p.is_active = 1').get(barcode)
}

function getById(id) {
  const db = getDb()
  return db.prepare(BASE_QUERY + ' WHERE p.id = ?').get(id)
}

function create(data) {
  const db = getDb()
  const result = db.prepare(`
    INSERT INTO products (barcode, name, category_id, price, cost, stock, unit, low_stock_threshold)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.barcode || null,
    data.name,
    data.category_id || null,
    data.price,
    data.cost || 0,
    data.stock || 0,
    data.unit || 'pcs',
    data.low_stock_threshold || 5
  )
  return getById(result.lastInsertRowid)
}

function update(id, data) {
  const db = getDb()
  const fields = []
  const values = []

  const allowed = ['barcode', 'name', 'category_id', 'price', 'cost', 'stock', 'unit', 'low_stock_threshold', 'is_active']
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`)
      values.push(data[key])
    }
  }
  fields.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')")
  values.push(id)

  db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  return getById(id)
}

function remove(id) {
  const db = getDb()
  // Soft delete
  db.prepare("UPDATE products SET is_active = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?").run(id)
  return { success: true }
}

module.exports = { getAll, getByBarcode, getById, create, update, remove }
