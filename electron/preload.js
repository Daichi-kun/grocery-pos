const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Products
  products: {
    getAll:       (filters)   => ipcRenderer.invoke('products:getAll', filters),
    getByBarcode: (barcode)   => ipcRenderer.invoke('products:getByBarcode', barcode),
    getById:      (id)        => ipcRenderer.invoke('products:getById', id),
    create:       (data)      => ipcRenderer.invoke('products:create', data),
    update:       (id, data)  => ipcRenderer.invoke('products:update', id, data),
    delete:       (id)        => ipcRenderer.invoke('products:delete', id),
  },

  // Categories
  categories: {
    getAll:  ()       => ipcRenderer.invoke('categories:getAll'),
    create:  (data)   => ipcRenderer.invoke('categories:create', data),
    update:  (id, d)  => ipcRenderer.invoke('categories:update', id, d),
    delete:  (id)     => ipcRenderer.invoke('categories:delete', id),
  },

  // Sales
  sales: {
    create:    (cart)    => ipcRenderer.invoke('sales:create', cart),
    getById:   (id)      => ipcRenderer.invoke('sales:getById', id),
    getRecent: (limit)   => ipcRenderer.invoke('sales:getRecent', limit),
    getAll:    (filters) => ipcRenderer.invoke('sales:getAll', filters),
    void:      (id)      => ipcRenderer.invoke('sales:void', id),
  },

  // Purchases
  purchases: {
    create:  (data)    => ipcRenderer.invoke('purchases:create', data),
    getAll:  (filters) => ipcRenderer.invoke('purchases:getAll', filters),
    getById: (id)      => ipcRenderer.invoke('purchases:getById', id),
  },

  // Returns
  returns: {
    create:  (data)    => ipcRenderer.invoke('returns:create', data),
    getAll:  (filters) => ipcRenderer.invoke('returns:getAll', filters),
  },

  // Reports
  reports: {
    dailySummary:  (date)  => ipcRenderer.invoke('reports:dailySummary', date),
    rangeSummary:  (range) => ipcRenderer.invoke('reports:rangeSummary', range),
    topProducts:   (range) => ipcRenderer.invoke('reports:topProducts', range),
    profitSummary: (range) => ipcRenderer.invoke('reports:profitSummary', range),
    dailyChart:    (range) => ipcRenderer.invoke('reports:dailyChart', range),
  },

  // Auth
  auth: {
    login:  (creds) => ipcRenderer.invoke('auth:login', creds),
    logout: ()      => ipcRenderer.invoke('auth:logout'),
  },

  // Users
  users: {
    getAll:  ()       => ipcRenderer.invoke('users:getAll'),
    create:  (data)   => ipcRenderer.invoke('users:create', data),
    update:  (id, d)  => ipcRenderer.invoke('users:update', id, d),
    delete:  (id)     => ipcRenderer.invoke('users:delete', id),
  },

  // Settings
  settings: {
    getAll:  ()      => ipcRenderer.invoke('settings:getAll'),
    update:  (kv)    => ipcRenderer.invoke('settings:update', kv),
  },

  // Printer
  printer: {
    printReceipt: (data) => ipcRenderer.invoke('printer:printReceipt', data),
    getStatus:    ()     => ipcRenderer.invoke('printer:getStatus'),
  },
})
