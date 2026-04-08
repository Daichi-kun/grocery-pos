const { getDb } = require('../database/db')

function create(payload) {
  const db = getDb()

  const createPurchase = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO purchases (reference, supplier_name, user_id, total_cost, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      payload.reference || null,
      payload.supplier_name || null,
      payload.user_id,
      payload.total_cost || 0,
      payload.notes || null
    )

    const purchaseId = result.lastInsertRowid

    const insertItem = db.prepare(`
      INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_cost, line_total)
      VALUES (?, ?, ?, ?, ?)
    `)
    const addStock = db.prepare(
      "UPDATE products SET stock = stock + ?, cost = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?"
    )

    let totalCost = 0
    for (const item of payload.items) {
      const lineTotal = item.quantity * item.unit_cost
      totalCost += lineTotal
      insertItem.run(purchaseId, item.product_id, item.quantity, item.unit_cost, lineTotal)
      addStock.run(item.quantity, item.unit_cost, item.product_id)
    }

    // Update total_cost with actual sum
    db.prepare('UPDATE purchases SET total_cost = ? WHERE id = ?').run(totalCost, purchaseId)

    return getById(purchaseId)
  })

  return createPurchase()
}

function getById(id) {
  const db = getDb()
  const purchase = db.prepare('SELECT * FROM purchases WHERE id = ?').get(id)
  if (!purchase) return null
  purchase.items = db.prepare(`
    SELECT pi.*, p.name as product_name, p.barcode
    FROM purchase_items pi JOIN products p ON pi.product_id = p.id
    WHERE pi.purchase_id = ?
  `).all(id)
  return purchase
}

function getAll(filters = {}) {
  const db = getDb()
  let where = []
  let params = []

  if (filters.date_from) { where.push('created_at >= ?'); params.push(filters.date_from) }
  if (filters.date_to)   { where.push('created_at <= ?'); params.push(filters.date_to) }

  const sql = 'SELECT * FROM purchases' + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY created_at DESC'
  return db.prepare(sql).all(...params)
}

module.exports = { create, getById, getAll }
