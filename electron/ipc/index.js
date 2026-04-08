const { ipcMain } = require('electron')
const productService  = require('../services/productService')
const categoryService = require('../services/categoryService')
const saleService     = require('../services/saleService')
const purchaseService = require('../services/purchaseService')
const returnService   = require('../services/returnService')
const reportService   = require('../services/reportService')
const userService     = require('../services/userService')
const settingsService = require('../services/settingsService')
const { printReceipt }= require('../utils/printer')

function registerAllHandlers() {
  // -- Products --
  ipcMain.handle('products:getAll',       (_, f)      => productService.getAll(f))
  ipcMain.handle('products:getByBarcode', (_, bc)     => productService.getByBarcode(bc))
  ipcMain.handle('products:getById',      (_, id)     => productService.getById(id))
  ipcMain.handle('products:create',       (_, d)      => productService.create(d))
  ipcMain.handle('products:update',       (_, id, d)  => productService.update(id, d))
  ipcMain.handle('products:delete',       (_, id)     => productService.remove(id))

  // -- Categories --
  ipcMain.handle('categories:getAll',  ()         => categoryService.getAll())
  ipcMain.handle('categories:create',  (_, d)     => categoryService.create(d))
  ipcMain.handle('categories:update',  (_, id, d) => categoryService.update(id, d))
  ipcMain.handle('categories:delete',  (_, id)    => categoryService.remove(id))

  // -- Sales --
  ipcMain.handle('sales:create',    (_, cart)  => saleService.create(cart))
  ipcMain.handle('sales:getById',   (_, id)    => saleService.getById(id))
  ipcMain.handle('sales:getRecent', (_, limit) => saleService.getRecent(limit))
  ipcMain.handle('sales:getAll',    (_, f)     => saleService.getAll(f))
  ipcMain.handle('sales:void',      (_, id)    => saleService.voidSale(id))

  // -- Purchases --
  ipcMain.handle('purchases:create',  (_, d) => purchaseService.create(d))
  ipcMain.handle('purchases:getAll',  (_, f) => purchaseService.getAll(f))
  ipcMain.handle('purchases:getById', (_, id)=> purchaseService.getById(id))

  // -- Returns --
  ipcMain.handle('returns:create', (_, d) => returnService.create(d))
  ipcMain.handle('returns:getAll', (_, f) => returnService.getAll(f))

  // -- Reports --
  ipcMain.handle('reports:dailySummary',  (_, date)  => reportService.dailySummary(date))
  ipcMain.handle('reports:rangeSummary',  (_, range) => reportService.rangeSummary(range))
  ipcMain.handle('reports:topProducts',   (_, range) => reportService.topProducts(range))
  ipcMain.handle('reports:profitSummary', (_, range) => reportService.profitSummary(range))
  ipcMain.handle('reports:dailyChart',    (_, range) => reportService.dailyChart(range))

  // -- Auth --
  ipcMain.handle('auth:login',  (_, creds) => userService.login(creds.username, creds.password))
  ipcMain.handle('auth:logout', ()         => ({ success: true }))

  // -- Users --
  ipcMain.handle('users:getAll',  ()         => userService.getAll())
  ipcMain.handle('users:create',  (_, d)     => userService.create(d))
  ipcMain.handle('users:update',  (_, id, d) => userService.update(id, d))
  ipcMain.handle('users:delete',  (_, id)    => userService.remove(id))

  // -- Settings --
  ipcMain.handle('settings:getAll', ()     => settingsService.getAll())
  ipcMain.handle('settings:update', (_, kv)=> settingsService.update(kv))

  // -- Printer --
  ipcMain.handle('printer:printReceipt', async (_, data) => {
    const settings = settingsService.getAll()
    return printReceipt(data, {
      storeName:     settings.store_name,
      currencySym:   settings.currency_sym,
      receiptFooter: settings.receipt_footer,
    })
  })
  ipcMain.handle('printer:getStatus', () => ({ available: true }))
}

module.exports = { registerAllHandlers }
