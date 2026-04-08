const { getDb } = require('../database/db')

function dailySummary(date) {
  const db = getDb()
  const dayStart = date + 'T00:00:00.000Z'
  const dayEnd   = date + 'T23:59:59.999Z'

  const summary = db.prepare(`
    SELECT
      COUNT(*) as transactions,
      COALESCE(SUM(total), 0) as revenue,
      COALESCE(SUM(discount_amount), 0) as discounts
    FROM sales
    WHERE created_at BETWEEN ? AND ? AND status = 'completed'
  `).get(dayStart, dayEnd)

  const profit = db.prepare(`
    SELECT COALESCE(SUM(si.line_total - (si.unit_cost * si.quantity)), 0) as profit
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    WHERE s.created_at BETWEEN ? AND ? AND s.status = 'completed'
  `).get(dayStart, dayEnd)

  return { ...summary, profit: profit.profit, date }
}

function rangeSummary(range) {
  const db = getDb()
  const { date_from, date_to } = range

  return db.prepare(`
    SELECT
      COUNT(*) as transactions,
      COALESCE(SUM(total), 0) as revenue,
      COALESCE(SUM(discount_amount), 0) as discounts
    FROM sales
    WHERE created_at BETWEEN ? AND ? AND status = 'completed'
  `).get(date_from, date_to + 'T23:59:59.999Z')
}

function topProducts(range) {
  const db = getDb()
  const { date_from, date_to, limit = 10 } = range

  return db.prepare(`
    SELECT
      si.product_id,
      si.product_name,
      SUM(si.quantity)   as total_qty,
      SUM(si.line_total) as total_revenue,
      SUM(si.line_total - si.unit_cost * si.quantity) as total_profit
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    WHERE s.created_at BETWEEN ? AND ? AND s.status = 'completed'
    GROUP BY si.product_id, si.product_name
    ORDER BY total_qty DESC
    LIMIT ?
  `).all(date_from, date_to + 'T23:59:59.999Z', limit)
}

function profitSummary(range) {
  const db = getDb()
  const { date_from, date_to } = range

  return db.prepare(`
    SELECT
      COALESCE(SUM(si.line_total), 0) as revenue,
      COALESCE(SUM(si.unit_cost * si.quantity), 0) as cost,
      COALESCE(SUM(si.line_total - si.unit_cost * si.quantity), 0) as profit
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    WHERE s.created_at BETWEEN ? AND ? AND s.status = 'completed'
  `).get(date_from, date_to + 'T23:59:59.999Z')
}

function dailyChart(range) {
  const db = getDb()
  const { date_from, date_to } = range

  return db.prepare(`
    SELECT
      date(created_at) as day,
      COUNT(*) as transactions,
      COALESCE(SUM(total), 0) as revenue
    FROM sales
    WHERE created_at BETWEEN ? AND ? AND status = 'completed'
    GROUP BY date(created_at)
    ORDER BY day
  `).all(date_from, date_to + 'T23:59:59.999Z')
}

module.exports = { dailySummary, rangeSummary, topProducts, profitSummary, dailyChart }
