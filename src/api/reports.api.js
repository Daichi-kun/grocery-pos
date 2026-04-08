const api = window.electronAPI.reports

export const getDailySummary  = (date)  => api.dailySummary(date)
export const getRangeSummary  = (range) => api.rangeSummary(range)
export const getTopProducts   = (range) => api.topProducts(range)
export const getProfitSummary = (range) => api.profitSummary(range)
export const getDailyChart    = (range) => api.dailyChart(range)
