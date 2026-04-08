const api = window.electronAPI.users

export const getUsers    = ()       => api.getAll()
export const createUser  = (data)   => api.create(data)
export const updateUser  = (id, d)  => api.update(id, d)
export const deleteUser  = (id)     => api.delete(id)
