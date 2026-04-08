import { useState, useEffect } from 'react'
import { getDailySummary, getTopProducts, getDailyChart, getProfitSummary } from '../../api/reports.api'
import { useSettingsStore } from '../../store/useSettingsStore'
import Spinner from '../../components/ui/Spinner'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { ru } from 'date-fns/locale'

const PRESETS = [
  { label: 'Сегодня',       days: 0 },
  { label: 'Неделя',        days: 7 },
  { label: 'Месяц',         days: 30 },
]

function StatCard({ icon, label, value, sub, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-700',
    green:  'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  }
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colors[color]}`}>{icon}</div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {sub && <div className="text-xs text-gray-400">{sub}</div>}
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const sym = useSettingsStore(s => s.currencySym)
  const [preset, setPreset] = useState(0)
  const [summary, setSummary] = useState(null)
  const [profit, setProfit] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  const today = format(new Date(), 'yyyy-MM-dd')

  const dateRange = preset === 0
    ? { date_from: today + 'T00:00:00.000Z', date_to: today + 'T23:59:59.999Z' }
    : {
        date_from: format(subDays(new Date(), preset), 'yyyy-MM-dd') + 'T00:00:00.000Z',
        date_to:   today + 'T23:59:59.999Z',
      }

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [s, p, top, chart] = await Promise.all([
          preset === 0
            ? getDailySummary(today)
            : window.electronAPI.reports.rangeSummary(dateRange),
          getProfitSummary(dateRange),
          getTopProducts({ ...dateRange, limit: 10 }),
          getDailyChart(dateRange),
        ])
        setSummary(s)
        setProfit(p)
        setTopProducts(top)
        setChartData(chart.map(d => ({
          ...d,
          day: format(new Date(d.day + 'T12:00:00'), 'dd.MM', { locale: ru }),
        })))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [preset])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Отчёты</h1>
        <div className="flex gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => setPreset(p.days)}
              className={`btn btn-sm ${preset === p.days ? 'btn-primary' : 'btn-secondary'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard icon="💰" label="Выручка"      value={`${sym}${(summary?.revenue || 0).toFixed(2)}`}    color="blue" />
            <StatCard icon="📈" label="Прибыль"      value={`${sym}${(profit?.profit || 0).toFixed(2)}`}      color="green" />
            <StatCard icon="🧾" label="Продаж"       value={summary?.transactions || 0}                        color="purple" />
            <StatCard icon="🏷️" label="Скидки"       value={`${sym}${(summary?.discounts || 0).toFixed(2)}`}  color="orange" />
          </div>

          {/* Chart */}
          {chartData.length > 1 && (
            <div className="card">
              <h2 className="font-semibold text-gray-800 mb-4">Выручка по дням</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [`${sym}${v.toFixed(2)}`, 'Выручка']} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top products */}
          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Топ товаров по продажам</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-2 text-xs text-gray-500 font-semibold uppercase">#</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-500 font-semibold uppercase">Товар</th>
                  <th className="text-right px-4 py-2 text-xs text-gray-500 font-semibold uppercase">Кол-во</th>
                  <th className="text-right px-4 py-2 text-xs text-gray-500 font-semibold uppercase">Выручка</th>
                  <th className="text-right px-4 py-2 text-xs text-gray-500 font-semibold uppercase">Прибыль</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">Нет данных за выбранный период</td></tr>
                )}
                {topProducts.map((p, i) => (
                  <tr key={p.product_id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 text-sm">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-sm">{p.product_name}</td>
                    <td className="px-4 py-3 text-right text-sm">{p.total_qty}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium">{sym}{p.total_revenue.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-sm text-green-600">{sym}{p.total_profit.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
