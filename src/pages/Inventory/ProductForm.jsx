import { useState, useEffect, useRef } from 'react'
import Modal from '../../components/ui/Modal'
import { createProduct, updateProduct } from '../../api/products.api'
import { getCategories } from '../../api/categories.api'
import toast from 'react-hot-toast'

const UNITS = ['pcs', 'kg', 'g', 'l', 'ml']
const UNIT_LABELS = { pcs: 'шт.', kg: 'кг', g: 'г', l: 'л', ml: 'мл' }

export default function ProductForm({ open, onClose, product, onSaved }) {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    barcode: '', name: '', category_id: '', price: '',
    cost: '', stock: '', unit: 'pcs', low_stock_threshold: '5',
  })
  const [loading, setLoading] = useState(false)
  const barcodeRef = useRef(null)
  const scanBuffer = useRef('')
  const lastScanTime = useRef(0)

  // Global scanner listener: captures fast keystrokes and fills barcode field
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      const now = Date.now()
      const target = e.target
      // If user is already typing in some other input — skip
      const isOtherInput = (
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') &&
        target !== barcodeRef.current
      )
      if (isOtherInput) { scanBuffer.current = ''; return }

      if (e.key === 'Enter') {
        if (scanBuffer.current.length > 2) {
          setForm(f => ({ ...f, barcode: scanBuffer.current }))
          barcodeRef.current?.focus()
          toast.success('Штрихкод отсканирован', { duration: 1200 })
        }
        scanBuffer.current = ''
        return
      }

      if (e.key.length === 1) {
        const interval = now - lastScanTime.current
        if (interval < 100) {
          scanBuffer.current += e.key
        } else {
          scanBuffer.current = e.key
        }
        lastScanTime.current = now
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  useEffect(() => {
    if (product) {
      setForm({
        barcode:             product.barcode || '',
        name:                product.name || '',
        category_id:         product.category_id || '',
        price:               product.price ?? '',
        cost:                product.cost ?? '',
        stock:               product.stock ?? '',
        unit:                product.unit || 'pcs',
        low_stock_threshold: product.low_stock_threshold ?? '5',
      })
    } else {
      setForm({ barcode: '', name: '', category_id: '', price: '', cost: '', stock: '', unit: 'pcs', low_stock_threshold: '5' })
    }
  }, [product, open])

  function set(field) {
    return (e) => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.price) { toast.error('Заполните название и цену'); return }

    setLoading(true)
    try {
      const data = {
        ...form,
        category_id:         form.category_id ? parseInt(form.category_id) : null,
        price:               parseFloat(form.price),
        cost:                parseFloat(form.cost) || 0,
        stock:               parseFloat(form.stock) || 0,
        low_stock_threshold: parseFloat(form.low_stock_threshold) || 5,
        barcode:             form.barcode || null,
      }

      if (product) {
        await updateProduct(product.id, data)
        toast.success('Товар обновлён')
      } else {
        await createProduct(data)
        toast.success('Товар добавлен')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Ошибка сохранения')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={product ? 'Редактировать товар' : 'Новый товар'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
            <input className="input" value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Штрихкод</label>
            <input ref={barcodeRef} className="input" value={form.barcode} onChange={set('barcode')} placeholder="Сканируйте или введите вручную" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
            <select className="input" value={form.category_id} onChange={set('category_id')}>
              <option value="">— Без категории —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Цена продажи *</label>
            <input className="input" type="number" step="0.01" min="0" value={form.price} onChange={set('price')} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Себестоимость</label>
            <input className="input" type="number" step="0.01" min="0" value={form.cost} onChange={set('cost')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Остаток</label>
            <input className="input" type="number" step="0.001" value={form.stock} onChange={set('stock')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Единица</label>
            <select className="input" value={form.unit} onChange={set('unit')}>
              {UNITS.map(u => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Порог низкого остатка</label>
            <input className="input" type="number" step="0.001" value={form.low_stock_threshold} onChange={set('low_stock_threshold')} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>Отмена</button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? 'Сохранение...' : product ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
