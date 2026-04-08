const { getDb } = require('../database/db')

function getAll() {
  const db = getDb()
  const rows = db.prepare('SELECT key, value FROM settings').all()
  return rows.reduce((acc, row) => {
    acc[row.key] = row.value
    return acc
  }, {})
}

function update(kvPairs) {
  const db = getDb()
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
  const updateMany = db.transaction((pairs) => {
    for (const [key, value] of Object.entries(pairs)) {
      stmt.run(key, String(value))
    }
  })
  updateMany(kvPairs)
  return getAll()
}

module.exports = { getAll, update }
