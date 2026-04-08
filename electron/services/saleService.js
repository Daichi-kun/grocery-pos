const { getDb } = require('../database/db')

function generateSaleNumber(db) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const today = new Date().toISOString().slice(0, 10)
  const count = db.prepare(
    "SELECT COUNT(*) as cnt FROM sales WHERE created_at >= ?"
  ).get(today + 'T00:00:00.000Z')
  const seq = String((count.cnt || 0) + 1).padStart(4, '0')
  return `SALE-${date}-${seq}`
}

function create(payload) {
  const db = getDb()

  const createSale = db.transaction(() => {
    const sale_number = generateSaleNumber(db)

    const saleResult = db.prepare(`
      INSERT INTO sales (sale_number, user_id, subtotal, discount_amount, total,
                         payment_method, cash_given, change_given, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?)
    `).run(
      sale_number,
      payload.user_id,
      payload.subtotal,
      payload.discount_amount || 0,
      payload.total,
      payload.payment_method || 'cash',
      payload.cash_given || null,
      payload.change_given || null,
      payload.notes || null
    )

    const saleId = saleResult.lastInsertRowid

    const insertItem = db.prepare(`
      INSERT INTO sale_items
        (sale_id, product_id, product_name, product_barcode, unit_price, unit_cost, quantity, discount_amount, line_total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const updateStock = db.prepare(
      "UPDATE products SET stock = stock - ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?"
    )

    for (const item of payload.items) {
      const product = db.prepare('SELECT stock, name, barcode, cost FROM products WHERE id = ?').get(item.product_id)
      if (!product) throw new Error(`Товар ID ${item.product_id} не найден`)

      insertItem.run(
        saleId,
        item.product_id,
        item.product_name || product.name,
        item.product_barcode || product.barcode,
        item.unit_price,
        item.unit_cost || product.cost || 0,
        item.quantity,
        item.discount_amount || 0,
        item.line_total
      )

      updateStock.run(item.quantity, item.product_id)
    }

    return getById(saleId)
  })

  return createSale()
}

function getById(id) {
  const db = getDb()
  const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(id)
  if (!sale) return null
  sale.items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(id)
  return sale
}

function getRecent(limit = 20) {
  const db = getDb()
  return db.prepare(
    'SELECT * FROM sales ORDER BY created_at DESC LIMIT ?'
  ).all(limit)
}

function getAll(filters = {}) {
  const db = getDb()
  let where = []
  let params = []

  if (filters.status)    { where.push('status = ?');               params.push(filters.status) }
  if (filters.date_from) { where.push('created_at >= ?');          params.push(filters.date_from) }
  if (filters.date_to)   { where.push('created_at <= ?');          params.push(filters.date_to) }
  if (filters.user_id)   { where.push('user_id = ?');              params.push(filters.user_id) }
  if (filters.search)    { where.push('sale_number LIKE ?');       params.push(`%${filters.search}%`) }

  const sql = 'SELECT * FROM sales' + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY created_at DESC'
  return db.prepare(sql).all(...params)
}

function voidSale(id) {
  const db = getDb()

  const doVoid = db.transaction(() => {
    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(id)
    if (!sale) throw new Error('Продажа не найдена')
    if (sale.status !== 'completed') throw new Error('Продажа уже отменена или возвращена')

    const items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(id)

    const restoreStock = db.prepare(
      "UPDATE products SET stock = stock + ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?"
    )
    for (const item of items) {
      restoreStock.run(item.quantity, item.product_id)
    }

    db.prepare("UPDATE sales SET status = 'voided' WHERE id = ?").run(id)
    return { success: true }
  })

  return doVoid()
}

module.exports = { create, getById, getRecent, getAll, voidSale }
