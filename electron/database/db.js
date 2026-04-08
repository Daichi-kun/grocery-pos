const Database = require('better-sqlite3')
const path = require('path')
const { app } = require('electron')

let _db = null

function getDb() {
  if (_db) return _db

  const dbDir = app ? app.getPath('userData') : path.join(__dirname, '../../')
  const dbPath = path.join(dbDir, 'pos.db')

  _db = new Database(dbPath)

  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')
  _db.pragma('synchronous = NORMAL')

  return _db
}

module.exports = { getDb }
