/**
 * Seed script — adds demo products for development.
 * Run: node scripts/seed.js
 */

const path = require('path')
const Database = require('better-sqlite3')

const dbPath = path.join(__dirname, '../pos.db')
const db = new Database(dbPath)

db.pragma('foreign_keys = ON')

// Read schema
const fs = require('fs')
const schema = fs.readFileSync(path.join(__dirname, '../electron/database/schema.sql'), 'utf8')
db.exec(schema)

const categories = db.prepare('SELECT id, name FROM categories').all()
const getCatId = (name) => categories.find(c => c.name.includes(name))?.id || null

const products = [
  { barcode: '4607006771123', name: 'Молоко 3.2% Простоквашино 1л', cat: 'Молочные', price: 89.90, cost: 65.00, stock: 50 },
  { barcode: '4600257901789', name: 'Кефир 3.2% 1л', cat: 'Молочные', price: 75.50, cost: 55.00, stock: 30 },
  { barcode: '4607053391123', name: 'Сметана 20% 400г', cat: 'Молочные', price: 120.00, cost: 85.00, stock: 25 },
  { barcode: '4600657004560', name: 'Хлеб белый нарезной', cat: 'Хлеб', price: 39.90, cost: 25.00, stock: 40 },
  { barcode: '4600657001239', name: 'Хлеб чёрный Бородинский', cat: 'Хлеб', price: 49.90, cost: 32.00, stock: 35 },
  { barcode: '4680033490123', name: 'Куриное филе 1кг', cat: 'Мясо', price: 289.00, cost: 210.00, stock: 20, unit: 'kg' },
  { barcode: '4680033490456', name: 'Свиная шея охл. 1кг', cat: 'Мясо', price: 359.00, cost: 270.00, stock: 15, unit: 'kg' },
  { barcode: '4001686771123', name: 'Яблоки Голден 1кг', cat: 'Фрукты', price: 89.00, cost: 60.00, stock: 30, unit: 'kg' },
  { barcode: '4001686771456', name: 'Бананы 1кг', cat: 'Фрукты', price: 79.90, cost: 55.00, stock: 25, unit: 'kg' },
  { barcode: '4601234560001', name: 'Вода Aqua Minerale 1.5л', cat: 'Напитки', price: 59.90, cost: 40.00, stock: 100 },
  { barcode: '4601234560002', name: 'Сок Добрый апельсин 1л', cat: 'Напитки', price: 89.00, cost: 65.00, stock: 60 },
  { barcode: '4601234560003', name: 'Coca-Cola 0.5л', cat: 'Напитки', price: 79.90, cost: 55.00, stock: 80 },
  { barcode: '4607008880001', name: 'Рис длиннозёрный 1кг', cat: 'Бакалея', price: 89.00, cost: 62.00, stock: 45 },
  { barcode: '4607008880002', name: 'Гречка 900г', cat: 'Бакалея', price: 79.00, cost: 55.00, stock: 50 },
  { barcode: '4607008880003', name: 'Макароны Barilla 400г', cat: 'Бакалея', price: 119.00, cost: 85.00, stock: 40 },
  { barcode: '4607008880004', name: 'Сахар белый 1кг', cat: 'Бакалея', price: 69.90, cost: 48.00, stock: 60 },
  { barcode: '4607008880005', name: 'Масло подсолнечное 1л', cat: 'Бакалея', price: 129.00, cost: 95.00, stock: 35 },
  { barcode: '4607008880006', name: 'Соль 1кг', cat: 'Бакалея', price: 29.90, cost: 18.00, stock: 80 },
  { barcode: '4680090010001', name: 'Шоколад Alpen Gold молочный 90г', cat: 'Кондитерские', price: 89.90, cost: 62.00, stock: 50 },
  { barcode: '4680090010002', name: 'Печенье Юбилейное 400г', cat: 'Кондитерские', price: 99.90, cost: 70.00, stock: 30 },
  { barcode: '4680090010003', name: 'Конфеты Raffaello 150г', cat: 'Кондитерские', price: 229.00, cost: 165.00, stock: 20 },
]

const insert = db.prepare(`
  INSERT OR IGNORE INTO products (barcode, name, category_id, price, cost, stock, unit, low_stock_threshold)
  VALUES (?, ?, ?, ?, ?, ?, ?, 5)
`)

let added = 0
for (const p of products) {
  const catId = getCatId(p.cat)
  const result = insert.run(p.barcode, p.name, catId, p.price, p.cost, p.stock, p.unit || 'pcs')
  if (result.changes > 0) added++
}

console.log(`✅ Добавлено ${added} тестовых товаров`)
console.log('Логины: admin/admin123, cashier/cashier123')

db.close()
