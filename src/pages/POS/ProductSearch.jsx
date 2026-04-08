import { useState, useRef, useEffect, forwardRef } from 'react'
import { getProducts } from '../../api/products.api'
import { useCartStore } from '../../store/useCartStore'
import toast from 'react-hot-toast'
import Spinner from '../../components/ui/Spinner'

const ProductSearch = forwardRef(function ProductSearch(_, ref) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const addItem = useCartStore(s => s.addItem)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const products = await getProducts({ search: query })
        setResults(products.slice(0, 8))
        setOpen(true)
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function select(product) {
    addItem(product)
    toast.success(`${product.name} добавлен`, { duration: 1500 })
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
        <input
          ref={ref}
          type="text"
          className="input pl-10 pr-10 text-base h-12"
          placeholder="Поиск товара или штрихкод... (F2)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner size="sm" />
          </span>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {results.map(p => (
            <li
              key={p.id}
              className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
              onClick={() => select(p)}
            >
              <div>
                <div className="font-medium text-gray-900 text-sm">{p.name}</div>
                {p.barcode && <div className="text-xs text-gray-400">{p.barcode}</div>}
              </div>
              <div className="text-right">
                <div className="font-semibold text-blue-600">₽{p.price.toFixed(2)}</div>
                <div className="text-xs text-gray-400">Остаток: {p.stock}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
})

export default ProductSearch
