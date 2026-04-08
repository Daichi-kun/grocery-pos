const api = window.electronAPI.categories

export const getCategories    = ()       => api.getAll()
export const createCategory   = (data)   => api.create(data)
export const updateCategory   = (id, d)  => api.update(id, d)
export const deleteCategory   = (id)     => api.delete(id)
