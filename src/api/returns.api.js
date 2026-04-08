const api = window.electronAPI.returns

export const createReturn = (data) => api.create(data)
export const getAllReturns = (f)   => api.getAll(f)
