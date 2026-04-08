import { useState, useEffect, useCallback } from 'react'
import { getAllReturns, createReturn } from '../../api/returns.api'
import { getSaleById } from '../../api/sales.api'
import { useAuthStore } from '../../store/useAuthStore'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

function ReturnForm({ open, onClose, onSaved }) {
  const user = useAuthStore(s => s.user)
  const [saleNumber, setSaleNumber] = useState('')
  const [sale, setSale] = useState(null)
  const [selectedItems, setSelectedItems] = useState({})
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)

  async function searchSale() {
    if (!saleNumber.trim()) return
    setSearching(true)
    setSale(null)
    setSelectedItems({})
    try {
      // Search by sale_number via getAll
      const sales = await window.electronAPI.sales.getAll({ search: saleNumber })
      const found = sales.find(s => s.sale_number === saleNumber.trim().toUpperCase())
      if (found) {
        const full = await getSaleById(found.id)
        setSale(full)
      } else {
        toast.error('Продажа не найдена')
      }
    } finally {
      setSearching(false)
    }
  }

  function toggleItem(item) {
    setSelectedItems(prev => {
      if (prev[item.id]) {
        const next = { ...prev }
        delete next[item.id]
        return next
      }
      return { ...prev, [item.id]: { ...item, returnQty: item.quantity } }
    })
  }

  function setReturnQty(itemId, qty) {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], returnQty: parseFloat(qty) || 0 }
    }))
  }

  const refundTotal = Object.values(selectedItems).reduce(
    (s, i) => s + (i.returnQty || 0) * i.unit_price, 0
  )

  async function handleSubmit(e) {
    e.preventDefault()
    const items = Object.values(selectedItems).filter(i => i.returnQty > 0)
    if (items.length === 0) { toast.error('Выберите товары для возврата'); return }

    setLoading(true)
    try {
      await createReturn({
        sale_id: sale.id,
        user_id: user.id,
        reason: reason || null,
        refund_amount: refundTotal,
        items: items.map(i => ({
          sale_item_id: i.id,
          product_id: i.product_id,
          quantity: i.returnQty,
          unit_price: i.unit_price,
        }))
      })
      toast.success('Возврат оформлен, остатки восстановлены')
      onSaved()
      onClose()
      setSale(null)
      setSaleNumber('')
    } catch (err) {
      toast.error(err.message || 'Ошибка возврата')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Оформить возврат" size="lg">
      <div className="space-y-4">
        {/* Search by sale number */}
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Номер чека (напр. SALE-20260330-0001)"
            value={saleNumber}
            onChange={e => setSaleNumber(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchSale()}
          />
          <button className="btn-primary" onClick={searchSale} disabled={searching}>
            {searching ? '...' : 'Найти'}
          </button>
        </div>

        {sale && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <div className="font-medium">{sale.sale_number}</div>
              <div className="text-gray-500">{format(new Date(sale.created_at), 'dd.MM.yyyy HH:mm')} · ₽{sale.total.toFixed(2)}</div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs text-gray-500 w-8"></th>
                    <th className="text-left px-3 py-2 text-xs text-gray-500">Товар</th>
                    <th className="text-right px-3 py-2 text-xs text-gray-500 w-20">Куплено</th>
                    <th className="text-right px-3 py-2 text-xs text-gray-500 w-20">Возврат</th>
                    <th className="text-right px-3 py-2 text-xs text-gray-500 w-24">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map(item => {
                    const sel = selectedItems[item.id]
                    return (
                      <tr key={item.id} className="border-t border-gray-100">
                        <td className="px-3 py-2">
                          <input type="checkbox" checked={!!sel} onChange={() => toggleItem(item)} />
                        </td>
                        <td className="px-3 py-2 text-sm">{item.product_name}</td>
                        <td className="px-3 py-2 text-right text-sm text-gray-500">{item.quantity}</td>
                        <td className="px-3 py-2">
                          <input
                            type="number" min="0.001" max={item.quantity} step="0.001"
                            className="input text-sm py-1 text-right w-20"
                            disabled={!sel}
                            value={sel?.returnQty ?? item.quantity}
                            onChange={e => setReturnQty(item.id, e.target.value)}
                          />
                        </td>
                        <td className="px-3 py-2 text-right text-sm font-medium">
                          {sel ? `₽${((sel.returnQty || 0) * item.unit_price).toFixed(2)}` : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Причина возврата</label>
              <input className="input" value={reason} onChange={e => setReason(e.target.value)} placeholder="Необязательно" />
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold">Сумма возврата: ₽{refundTotal.toFixed(2)}</span>
              <div className="flex gap-3">
                <button type="button" className="btn-secondary" onClick={onClose}>Отмена</button>
                <button type="submit" className="btn-danger" disabled={loading || Object.keys(selectedItems).length === 0}>
                  {loading ? 'Оформление...' : 'Оформить возврат'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { setReturns(await getAllReturns()) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Возвраты</h1>
        <button className="btn-primary" onClick={() => setFormOpen(true)}>+ Оформить возврат</button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Дата</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Чек</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Кассир</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Причина</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {returns.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">Возвратов пока нет</td></tr>
              )}
              {returns.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{format(new Date(r.created_at), 'dd.MM.yyyy HH:mm')}</td>
                  <td className="px-4 py-3 font-medium text-sm">{r.sale_number}</td>
                  <td className="px-4 py-3 text-sm">{r.cashier_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{r.reason || '—'}</td>
                  <td className="px-4 py-3 text-right font-medium text-red-600">−₽{r.refund_amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ReturnForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={load} />
    </div>
  )
}
