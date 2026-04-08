const { BrowserWindow } = require('electron')

/**
 * Print receipt using Electron's built-in print dialog.
 * Falls back gracefully if no printer is available.
 */
async function printReceipt(saleData, settings) {
  try {
    const { storeName, currencySym, receiptFooter } = settings

    const html = buildReceiptHtml(saleData, storeName, currencySym, receiptFooter)

    const win = new BrowserWindow({
      show: false,
      webPreferences: { contextIsolation: true }
    })

    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)

    return new Promise((resolve) => {
      win.webContents.print(
        { silent: true, printBackground: true },
        (success, errorType) => {
          win.close()
          if (success) {
            resolve({ success: true })
          } else {
            resolve({ success: false, reason: errorType || 'print_failed' })
          }
        }
      )
    })
  } catch (err) {
    return { success: false, reason: err.message }
  }
}

function buildReceiptHtml(sale, storeName, sym, footer) {
  const date = new Date(sale.created_at).toLocaleString('ru-RU')
  const itemsHtml = sale.items.map(i => `
    <tr>
      <td style="padding:2px 4px">${i.product_name}</td>
      <td style="text-align:center;padding:2px 4px">${i.quantity}</td>
      <td style="text-align:right;padding:2px 4px">${sym}${i.unit_price.toFixed(2)}</td>
      <td style="text-align:right;padding:2px 4px">${sym}${i.line_total.toFixed(2)}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: monospace; font-size: 12px; width: 280px; margin: 0 auto; padding: 8px; }
  h2 { text-align: center; margin: 4px 0; font-size: 16px; }
  .center { text-align: center; }
  .divider { border-top: 1px dashed #000; margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 11px; border-bottom: 1px solid #000; }
  .total-row td { font-weight: bold; border-top: 1px solid #000; padding-top: 4px; }
  .footer { text-align: center; margin-top: 8px; font-size: 11px; }
</style>
</head>
<body>
  <h2>${storeName}</h2>
  <div class="center">${date}</div>
  <div class="center">Чек №${sale.sale_number}</div>
  <div class="divider"></div>
  <table>
    <thead>
      <tr>
        <th>Товар</th><th style="text-align:center">Кол</th>
        <th style="text-align:right">Цена</th><th style="text-align:right">Итог</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="3">ИТОГО:</td>
        <td style="text-align:right">${sym}${sale.total.toFixed(2)}</td>
      </tr>
      ${sale.cash_given ? `
      <tr><td colspan="3">Наличные:</td><td style="text-align:right">${sym}${sale.cash_given.toFixed(2)}</td></tr>
      <tr><td colspan="3">Сдача:</td><td style="text-align:right">${sym}${sale.change_given.toFixed(2)}</td></tr>
      ` : ''}
    </tfoot>
  </table>
  <div class="divider"></div>
  <div class="footer">${footer}</div>
</body>
</html>`
}

module.exports = { printReceipt }
