import { useSettingsStore } from '../../store/useSettingsStore'
import { useCartStore } from '../../store/useCartStore'

export default function CartItem({ item, selected, onSelect }) {
  const sym = useSettingsStore(s => s.currencySym)
  const { updateQuantity, removeItem } = useCartStore()

  function handleQty(e) {
    const val = parseFloat(e.target.value)
    if (!isNaN(val)) updateQuantity(item.product_id, val)
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors border
        ${selected ? 'border-blue-400 bg-blue-50' : 'border-transparent hover:bg-gray-50'}`}
      onClick={onSelect}
    >
      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900 truncate">{item.product_name}</div>
        <div className="text-xs text-gray-400">{sym}{item.unit_price.toFixed(2)} за шт.</div>
      </div>

      {/* Qty control */}
      <div className="flex items-center gap-1">
        <button
          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold transition-colors"
          onClick={e => { e.stopPropagation(); updateQuantity(item.product_id, item.quantity - 1) }}
        >−</button>
        <input
          className="w-12 text-center text-sm font-medium border border-gray-200 rounded-lg h-7 focus:outline-none focus:ring-1 focus:ring-blue-400"
          value={item.quantity}
          onChange={handleQty}
          onClick={e => e.stopPropagation()}
          type="number"
          min="0.001"
          step="1"
        />
        <button
          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold transition-colors"
          onClick={e => { e.stopPropagation(); updateQuantity(item.product_id, item.quantity + 1) }}
        >+</button>
      </div>

      {/* Line total */}
      <div className="w-20 text-right font-semibold text-sm text-gray-900">
        {sym}{item.line_total.toFixed(2)}
      </div>

      {/* Delete */}
      <button
        className="w-7 h-7 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors text-lg flex items-center justify-center"
        onClick={e => { e.stopPropagation(); removeItem(item.product_id) }}
      >×</button>
    </div>
  )
}
