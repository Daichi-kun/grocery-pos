import { useState, useEffect } from 'react'
import { getAllSettings, updateSettings } from '../../api/settings.api'
import { useSettingsStore } from '../../store/useSettingsStore'
import toast from 'react-hot-toast'
import { getCategories, createCategory, deleteCategory } from '../../api/categories.api'
import Modal from '../../components/ui/Modal'

function CategoriesSection() {
  const [categories, setCategories] = useState([])
  const [newCat, setNewCat] = useState({ name: '', color: '#6366f1' })
  const [adding, setAdding] = useState(false)

  useEffect(() => { getCategories().then(setCategories) }, [])

  async function handleAdd(e) {
    e.preventDefault()
    if (!newCat.name) return
    setAdding(true)
    try {
      await createCategory(newCat)
      toast.success('Категория добавлена')
      setNewCat({ name: '', color: '#6366f1' })
      getCategories().then(setCategories)
    } finally { setAdding(false) }
  }

  async function handleDelete(cat) {
    if (!confirm(`Удалить категорию "${cat.name}"?`)) return
    await deleteCategory(cat.id)
    toast.success('Категория удалена')
    getCategories().then(setCategories)
  }

  return (
    <div className="card space-y-4">
      <h2 className="font-semibold text-gray-800">Категории товаров</h2>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input className="input flex-1" placeholder="Название категории" value={newCat.name} onChange={e => setNewCat(f => ({ ...f, name: e.target.value }))} />
        <input type="color" className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer" value={newCat.color} onChange={e => setNewCat(f => ({ ...f, color: e.target.value }))} />
        <button type="submit" className="btn-primary btn-sm" disabled={adding || !newCat.name}>+ Добавить</button>
      </form>
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <div key={c.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
               style={{ background: c.color + '22', color: c.color }}>
            {c.name}
            <button onClick={() => handleDelete(c)} className="hover:opacity-70 ml-1 font-bold">×</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const loadSettings = useSettingsStore(s => s.loadSettings)
  const [form, setForm] = useState({
    store_name: '', currency: '', currency_sym: '',
    tax_rate: '', receipt_footer: '', low_stock_alert: '1'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getAllSettings().then(s => {
      setForm({
        store_name:     s.store_name || '',
        currency:       s.currency || 'RUB',
        currency_sym:   s.currency_sym || '₽',
        tax_rate:       s.tax_rate || '0',
        receipt_footer: s.receipt_footer || '',
        low_stock_alert:s.low_stock_alert || '1',
      })
      setLoading(false)
    })
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateSettings(form)
      await loadSettings()
      toast.success('Настройки сохранены')
    } catch (err) {
      toast.error('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6 text-gray-400">Загрузка...</div>

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>

      <form onSubmit={handleSave} className="card space-y-4">
        <h2 className="font-semibold text-gray-800">Основные</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Название магазина</label>
          <input className="input" value={form.store_name} onChange={e => setForm(f => ({ ...f, store_name: e.target.value }))} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Валюта (код)</label>
            <input className="input" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} placeholder="RUB" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Символ валюты</label>
            <input className="input" value={form.currency_sym} onChange={e => setForm(f => ({ ...f, currency_sym: e.target.value }))} placeholder="₽" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ставка НДС (%)</label>
          <input className="input" type="number" min="0" max="100" step="0.01" value={form.tax_rate}
            onChange={e => setForm(f => ({ ...f, tax_rate: e.target.value }))} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Текст в конце чека</label>
          <textarea className="input" rows={2} value={form.receipt_footer}
            onChange={e => setForm(f => ({ ...f, receipt_footer: e.target.value }))} />
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="low_stock" checked={form.low_stock_alert === '1'}
            onChange={e => setForm(f => ({ ...f, low_stock_alert: e.target.checked ? '1' : '0' }))} />
          <label htmlFor="low_stock" className="text-sm font-medium text-gray-700">
            Показывать предупреждения о низком остатке
          </label>
        </div>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Сохранение...' : 'Сохранить настройки'}
        </button>
      </form>

      <CategoriesSection />
    </div>
  )
}
