import { useState, useEffect, useCallback } from 'react'
import { getAllPurchases, createPurchase } from '../../api/purchases.api'
import { getProducts } from '../../api/products.api'
import { useAuthStore } from '../../store/useAuthStore'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

function PurchaseForm({ open, onClose, onSaved }) {
  const user = useAuthStore(s => s.user)
  const [supplier, setSupplier] = useState('')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState([{ product_id: '', product_name: '', quantity: 1, unit_cost: 0 }])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) getProducts().then(setProducts)
  }, [open])

  function addLine()   { setItems(i => [...i, { product_id: '', product_name: '', quantity: 1, unit_cost: 0 }]) }
  function removeLine(idx) { setItems(i => i.filter((_, j) => j !== idx)) }

  function updateLine(idx, field, value) {
    setItems(items.map((item, i) => {
      if (i !== idx) return item
      if (field === 'product_id') {
        const p = products.find(p => p.id === parseInt(value))
        return { ...item, product_id: parseInt(value), product_name: p?.name || '', unit_cost: p?.cost || 0 }
      }
      return { ...item, [field]: value }
    }))
  }

  const totalCost = items.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unit_cost) || 0), 0)

  async function handleSubmit(e) {
    e.preventDefault()
    const validItems = items.filter(i => i.product_id && i.quantity > 0)
    if (validItems.length === 0) { toast.error('Добавьте хотя бы один товар'); return }

    setLoading(true)
    try {
      await createPurchase({
        supplier_name: supplier || null,
        reference: reference || null,
        user_id: user.id,
        notes: notes || null,
        total_cost: totalCost,
        items: validItems.map(i => ({
          product_id: i.product_id,
          quantity: parseFloat(i.quantity),
          unit_cost: parseFloat(i.unit_cost) || 0,
        }))
      })
      toast.success('Закупка сохранена, остатки обновлены')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Ошибка сохранения')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Новая закупка" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Поставщик</label>
            <input className="input" value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Название поставщика" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Номер накладной</label>
            <input className="input" value={reference} onChange={e => setReference(e.target.value)} placeholder="№ счёт-фактуры" />
          </div>
        </div>

        {/* Items */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 text-xs text-gray-500">Товар</th>
                <th className="text-right px-3 py-2 text-xs text-gray-500 w-24">Кол-во</th>
                <th className="text-right px-3 py-2 text-xs text-gray-500 w-28">Цена закупки</th>
                <th className="text-right px-3 py-2 text-xs text-gray-500 w-24">Сумма</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-t border-gray-100">
                  <td className="px-2 py-2">
                    <select
                      className="input text-sm py-1.5"
                      value={item.product_id}
                      onChange={e => updateLine(idx, 'product_id', e.target.value)}
                    >
                      <option value="">— выберите —</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <input type="number" className="input text-sm py-1.5 text-right" min="0.001" step="0.001"
                      value={item.quantity} onChange={e => updateLine(idx, 'quantity', e.target.value)} />
                  </td>
                  <td className="px-2 py-2">
                    <input type="number" className="input text-sm py-1.5 text-right" min="0" step="0.01"
                      value={item.unit_cost} onChange={e => updateLine(idx, 'unit_cost', e.target.value)} />
                  </td>
                  <td className="px-3 py-2 text-right text-sm font-medium">
                    ₽{((parseFloat(item.quantity)||0) * (parseFloat(item.unit_cost)||0)).toFixed(2)}
                  </td>
                  <td className="px-2 py-2">
                    <button type="button" onClick={() => removeLine(idx)}
                      className="text-gray-300 hover:text-red-500 transition-colors text-lg">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-3 py-2 border-t border-gray-100 flex justify-between items-center">
            <button type="button" className="btn-secondary btn-sm" onClick={addLine}>+ Добавить строку</button>
            <span className="font-semibold text-sm">Итого: ₽{totalCost.toFixed(2)}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Примечание</label>
          <textarea className="input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        <div className="flex gap-3">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>Отмена</button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить закупку'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setPurchases(await getAllPurchases())
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Закупки</h1>
        <button className="btn-primary" onClick={() => setFormOpen(true)}>+ Новая закупка</button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Дата</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Поставщик</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Накладная</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 && (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">Закупок пока нет</td></tr>
              )}
              {purchases.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {format(new Date(p.created_at), 'dd.MM.yyyy HH:mm')}
                  </td>
                  <td className="px-4 py-3 font-medium">{p.supplier_name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.reference || '—'}</td>
                  <td className="px-4 py-3 text-right font-medium">₽{p.total_cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <PurchaseForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={load} />
    </div>
  )
}
