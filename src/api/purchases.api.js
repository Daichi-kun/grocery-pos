const api = window.electronAPI.purchases

export const createPurchase  = (data) => api.create(data)
export const getAllPurchases  = (f)    => api.getAll(f)
export const getPurchaseById = (id)   => api.getById(id)
