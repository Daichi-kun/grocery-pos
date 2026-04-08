import { useState, useRef, useEffect } from 'react'
import { useCartStore } from '../../store/useCartStore'
import { useAuthStore } from '../../store/useAuthStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { createSale } from '../../api/sales.api'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'

export default function PaymentModal({ open, onClose, onSuccess }) {
  const [cashGiven, setCashGiven] = useState('')
  const [loading, setLoading] = useState(false)
  const cashInputRef = useRef(null)

  const { items, discount, getTotal, getSubtotal, clearCart } = useCartStore()
  const user = useAuthStore(s => s.user)
  const sym = useSettingsStore(s => s.currencySym)

  const total = getTotal()
  const subtotal = getSubtotal()
  const cash = parseFloat(cashGiven) || 0
  const change = Math.max(0, cash - total)
  const canComplete = cash >= total

  useEffect(() => {
    if (open) {
      setCashGiven('')
      setTimeout(() => cashInputRef.current?.focus(), 100)
    }
  }, [open])

  // Quick cash buttons
  const quickAmounts = [
    Math.ceil(total / 10) * 10,
    Math.ceil(total / 50) * 50,
    Math.ceil(total / 100) * 100,
    Math.ceil(total / 500) * 500,
  ].filter((v, i, arr) => v > 0 && arr.indexOf(v) === i).slice(0, 4)

  async function handleComplete() {
    if (!canComplete || loading) return
    setLoading(true)
    try {
      const sale = await createSale({
        user_id: user.id,
        items,
        subtotal,
        discount_amount: discount,
        total,
        payment_method: 'cash',
        cash_given: cash,
        change_given: change,
      })
      clearCart()
      onSuccess(sale)
      onClose()
    } catch (err) {
      toast.error(err.message || 'Ошибка при оформлении продажи')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && canComplete) handleComplete()
  }

  return (
    <Modal open={open} onClose={onClose} title="Оплата" size="sm">
      <div className="space-y-4">
        {/* Summary */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Подытог</span>
            <span>{sym}{subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Скидка</span>
              <span>−{sym}{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-gray-900 pt-1 border-t border-gray-200">
            <span>ИТОГО</span>
            <span>{sym}{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Cash input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Наличные от покупателя</label>
          <input
            ref={cashInputRef}
            type="number"
            className="input text-xl font-bold text-center h-14"
            value={cashGiven}
            onChange={e => setCashGiven(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={sym + total.toFixed(2)}
            min={0}
            step="0.01"
          />
        </div>

        {/* Quick amounts */}
        <div className="grid grid-cols-4 gap-2">
          {quickAmounts.map(a => (
            <button
              key={a}
              onClick={() => setCashGiven(String(a))}
              className="btn btn-secondary text-sm py-2"
            >
              {sym}{a}
            </button>
          ))}
        </div>

        {/* Change */}
        {cash > 0 && (
          <div className={`text-center text-xl font-bold rounded-xl py-3 ${canComplete ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {canComplete
              ? `Сдача: ${sym}${change.toFixed(2)}`
              : `Не хватает: ${sym}${(total - cash).toFixed(2)}`}
          </div>
        )}

        {/* Complete button */}
        <button
          className="btn-success btn-lg w-full"
          disabled={!canComplete || loading}
          onClick={handleComplete}
        >
          {loading ? 'Оформление...' : '✓ Завершить продажу (Enter)'}
        </button>
      </div>
    </Modal>
  )
}
