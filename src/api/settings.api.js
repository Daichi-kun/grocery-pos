const api = window.electronAPI.settings

export const getAllSettings = ()     => api.getAll()
export const updateSettings = (kv)  => api.update(kv)
