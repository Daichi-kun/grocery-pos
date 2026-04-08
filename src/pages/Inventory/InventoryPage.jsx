import { useState, useEffect, useCallback } from 'react'
import { getProducts, deleteProduct } from '../../api/products.api'
import { getCategories } from '../../api/categories.api'
import ProductForm from './ProductForm'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function InventoryPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showLowStock, setShowLowStock] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const [prods, cats] = await Promise.all([
        getProducts({ search, category_id: categoryFilter || undefined, lowStock: showLowStock }),
        getCategories()
      ])
      setProducts(prods)
      setCategories(cats)
    } finally {
      setLoading(false)
    }
  }, [search, categoryFilter, showLowStock])

  useEffect(() => { loadProducts() }, [loadProducts])

  async function handleDelete(product) {
    if (!confirm(`Удалить "${product.name}"?`)) return
    try {
      await deleteProduct(product.id)
      toast.success('Товар удалён')
      loadProducts()
    } catch (err) {
      toast.error(err.message)
    }
  }

  function openAdd()  { setEditProduct(null); setFormOpen(true) }
  function openEdit(p){ setEditProduct(p);    setFormOpen(true) }

  const lowStockCount = products.filter(p => p.stock <= p.low_stock_threshold).length

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Товары</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} товаров</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Добавить товар</button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          className="input w-64"
          placeholder="Поиск по названию или штрихкоду..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="input w-48" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">Все категории</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button
          className={`btn ${showLowStock ? 'btn-danger' : 'btn-secondary'}`}
          onClick={() => setShowLowStock(!showLowStock)}
        >
          ⚠️ Низкий остаток {lowStockCount > 0 && `(${lowStockCount})`}
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Товар</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Категория</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Цена</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Себест.</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Остаток</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Товары не найдены</td></tr>
              )}
              {products.map(p => {
                const isLow = p.stock <= p.low_stock_threshold
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{p.name}</div>
                      {p.barcode && <div className="text-xs text-gray-400">{p.barcode}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {p.category_name ? (
                        <span className="badge" style={{ background: p.category_color + '22', color: p.category_color }}>
                          {p.category_name}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">₽{p.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-gray-500">₽{p.cost.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${isLow ? 'text-red-600' : 'text-gray-700'}`}>
                        {p.stock} {p.unit}
                      </span>
                      {isLow && <span className="ml-1 text-xs text-red-500">⚠️</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button className="btn-secondary btn-sm" onClick={() => openEdit(p)}>Изм.</button>
                        <button className="btn btn-sm text-red-600 hover:bg-red-50" onClick={() => handleDelete(p)}>Удал.</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <ProductForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        product={editProduct}
        onSaved={loadProducts}
      />
    </div>
  )
}
