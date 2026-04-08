import { create } from 'zustand'

export const useSettingsStore = create((set) => ({
  storeName:     'Продуктовый магазин',
  currency:      'RUB',
  currencySym:   '₽',
  taxRate:       0,
  receiptFooter: 'Спасибо за покупку!',
  lowStockAlert: true,
  theme:         'light',

  loadSettings: async () => {
    const raw = await window.electronAPI.settings.getAll()
    set({
      storeName:     raw.store_name     || 'Продуктовый магазин',
      currency:      raw.currency       || 'RUB',
      currencySym:   raw.currency_sym   || '₽',
      taxRate:       parseFloat(raw.tax_rate) || 0,
      receiptFooter: raw.receipt_footer || 'Спасибо за покупку!',
      lowStockAlert: raw.low_stock_alert === '1',
      theme:         raw.theme          || 'light',
    })
  },

  updateSetting: async (kv) => {
    await window.electronAPI.settings.update(kv)
  },
}))
