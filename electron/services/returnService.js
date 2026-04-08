const { getDb } = require('../database/db')

function create(payload) {
  const db = getDb()

  const doReturn = db.transaction(() => {
    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(payload.sale_id)
    if (!sale) throw new Error('Продажа не найдена')
    if (sale.status === 'voided') throw new Error('Продажа уже отменена')

    const result = db.prepare(`
      INSERT INTO returns (sale_id, user_id, reason, refund_amount)
      VALUES (?, ?, ?, ?)
    `).run(payload.sale_id, payload.user_id, payload.reason || null, payload.refund_amount)

    const returnId = result.lastInsertRowid

    const insertReturnItem = db.prepare(`
      INSERT INTO return_items (return_id, sale_item_id, product_id, quantity, refund_line)
      VALUES (?, ?, ?, ?, ?)
    `)
    const restoreStock = db.prepare(
      "UPDATE products SET stock = stock + ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?"
    )

    for (const item of payload.items) {
      const refundLine = item.quantity * item.unit_price
      insertReturnItem.run(returnId, item.sale_item_id, item.product_id, item.quantity, refundLine)
      restoreStock.run(item.quantity, item.product_id)
    }

    // Mark sale as returned if all items returned
    db.prepare("UPDATE sales SET status = 'returned' WHERE id = ?").run(payload.sale_id)

    return { id: returnId, ...payload }
  })

  return doReturn()
}

function getAll(filters = {}) {
  const db = getDb()
  let where = []
  let params = []

  if (filters.date_from) { where.push('r.created_at >= ?'); params.push(filters.date_from) }
  if (filters.date_to)   { where.push('r.created_at <= ?'); params.push(filters.date_to) }

  const sql = `
    SELECT r.*, s.sale_number, u.full_name as cashier_name
    FROM returns r
    JOIN sales s ON r.sale_id = s.id
    JOIN users u ON r.user_id = u.id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY r.created_at DESC
  `
  return db.prepare(sql).all(...params)
}

module.exports = { create, getAll }
