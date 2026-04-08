const api = window.electronAPI.products

export const getProducts    = (f)      => api.getAll(f)
export const getByBarcode   = (bc)     => api.getByBarcode(bc)
export const getProductById = (id)     => api.getById(id)
export const createProduct  = (data)   => api.create(data)
export const updateProduct  = (id, d)  => api.update(id, d)
export const deleteProduct  = (id)     => api.delete(id)
