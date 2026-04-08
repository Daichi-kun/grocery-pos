import { useState, useRef, useEffect } from 'react'
import { useCartStore } from '../../store/useCartStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { useAuthStore } from '../../store/useAuthStore'
import BarcodeInput from './BarcodeInput'
import ProductSearch from './ProductSearch'
import CartItem from './CartItem'
import PaymentModal from './PaymentModal'
import ReceiptModal from './ReceiptModal'

export default function POSPage() {
  const [payOpen, setPayOpen] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [selectedIdx, setSelectedIdx] = useState(null)
  const [discountInput, setDiscountInput] = useState('')
  const [showDiscount, setShowDiscount] = useState(false)
  const searchRef = useRef(null)

  const { items, discount, setDiscount, clearCart, getSubtotal, getTotal } = useCartStore()
  const sym = useSettingsStore(s => s.currencySym)
  const user = useAuthStore(s => s.user)

  const subtotal = getSubtotal()
  const total = getTotal()

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const target = e.target
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'

      if (e.key === 'F10' && items.length > 0) {
        e.preventDefault()
        setPayOpen(true)
      }
      if (e.key === 'Escape' && !payOpen) {
        if (isInput) target.blur()
      }
      if (e.key === '+' && !isInput && selectedIdx !== null) {
        e.preventDefault()
        const item = items[selectedIdx]
        if (item) useCartStore.getState().updateQuantity(item.product_id, item.quantity + 1)
      }
      if (e.key === '-' && !isInput && selectedIdx !== null) {
        e.preventDefault()
        const item = items[selectedIdx]
        if (item) useCartStore.getState().updateQuantity(item.product_id, item.quantity - 1)
      }
      if (e.key === 'Delete' && !isInput && selectedIdx !== null) {
        e.preventDefault()
        const item = items[selectedIdx]
        if (item) useCartStore.getState().removeItem(item.product_id)
        setSelectedIdx(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [items, payOpen, selectedIdx])

  function applyDiscount() {
    const val = parseFloat(discountInput)
    if (!isNaN(val) && val >= 0) setDiscount(val)
    setShowDiscount(false)
    setDiscountInput('')
  }

  function handleSaleSuccess(sale) {
    setReceipt(sale)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <BarcodeInput searchRef={searchRef} />

      {/* Left: Search + product info */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        {/* Search bar */}
        <ProductSearch ref={searchRef} />

        {/* Empty state */}
        {items.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <div className="text-6xl mb-4">🛒</div>
            <div className="text-xl font-medium">Корзина пуста</div>
            <div className="text-sm mt-2">Отсканируйте штрихкод или найдите товар</div>
            <div className="text-xs mt-4 text-gray-300">F2 — поиск · F10 — оплата</div>
          </div>
        )}

        {/* Quick tip */}
        {items.length > 0 && (
          <div className="text-xs text-gray-400 text-center">
            F10 — оплата · F2 — поиск · +/− — количество · Del — удалить
          </div>
        )}
      </div>

      {/* Right: Cart panel */}
      <div className="w-96 bg-white flex flex-col border-l border-gray-200 shadow-xl">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="font-semibold text-gray-800">Корзина</span>
          <span className="text-sm text-gray-400">{items.length} поз.</span>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {items.map((item, idx) => (
            <CartItem
              key={item.product_id}
              item={item}
              selected={selectedIdx === idx}
              onSelect={() => setSelectedIdx(idx === selectedIdx ? null : idx)}
            />
          ))}
        </div>

        {/* Summary */}
        <div className="border-t border-gray-100 px-4 py-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Подытог</span>
            <span>{sym}{subtotal.toFixed(2)}</span>
          </div>

          {/* Discount row */}
          {showDiscount ? (
            <div className="flex gap-2 items-center">
              <input
                autoFocus
                type="number"
                className="input text-sm py-1.5 flex-1"
                placeholder="Скидка ₽"
                value={discountInput}
                onChange={e => setDiscountInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyDiscount()}
              />
              <button className="btn-primary btn-sm" onClick={applyDiscount}>ОК</button>
              <button className="btn-secondary btn-sm" onClick={() => setShowDiscount(false)}>✕</button>
            </div>
          ) : (
            <div className="flex justify-between text-sm">
              <button
                className="text-blue-600 hover:underline text-sm"
                onClick={() => setShowDiscount(true)}
              >
                + Скидка
              </button>
              {discount > 0 && (
                <span className="text-green-600 font-medium">−{sym}{discount.toFixed(2)}</span>
              )}
            </div>
          )}

          <div className="flex justify-between text-xl font-bold text-gray-900 pt-1 border-t border-gray-200">
            <span>ИТОГО</span>
            <span>{sym}{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="px-4 pb-4 space-y-2">
          <button
            className="btn-success btn-lg w-full text-lg"
            disabled={items.length === 0}
            onClick={() => setPayOpen(true)}
          >
            💰 Оплата (F10)
          </button>
          <button
            className="btn-secondary btn-sm w-full"
            disabled={items.length === 0}
            onClick={() => { clearCart(); setSelectedIdx(null) }}
          >
            Очистить корзину
          </button>
        </div>
      </div>

      {/* Modals */}
      <PaymentModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        onSuccess={handleSaleSuccess}
      />
      <ReceiptModal
        open={!!receipt}
        sale={receipt}
        onClose={() => setReceipt(null)}
      />
    </div>
  )
}
