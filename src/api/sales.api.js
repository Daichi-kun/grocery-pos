const api = window.electronAPI.sales

export const createSale   = (cart)    => api.create(cart)
export const getSaleById  = (id)      => api.getById(id)
export const getRecentSales = (limit) => api.getRecent(limit)
export const getAllSales   = (f)      => api.getAll(f)
export const voidSale     = (id)     => api.void(id)
