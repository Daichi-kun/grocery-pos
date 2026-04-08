import { useEffect, useRef, useCallback } from 'react'
import { getByBarcode } from '../../api/products.api'
import { useCartStore } from '../../store/useCartStore'
import toast from 'react-hot-toast'

/**
 * Invisible component that captures global keyboard events.
 * Barcode scanners emit rapid keystrokes followed by Enter.
 * We accumulate chars and flush on Enter (if buffer has > 2 chars and came fast).
 */
export default function BarcodeInput({ onManualSearch, searchRef }) {
  const buffer = useRef('')
  const lastKeyTime = useRef(0)
  const addItem = useCartStore(s => s.addItem)

  const handleScan = useCallback(async (barcode) => {
    if (!barcode.trim()) return
    try {
      const product = await getByBarcode(barcode.trim())
      if (product) {
        addItem(product)
        toast.success(`${product.name} добавлен`, { duration: 1500 })
      } else {
        toast.error(`Штрихкод не найден: ${barcode}`, { duration: 2000 })
      }
    } catch (err) {
      toast.error('Ошибка поиска товара')
    }
  }, [addItem])

  useEffect(() => {
    const handler = (e) => {
      const now = Date.now()
      const target = e.target

      // Don't intercept if user is typing in an input/textarea/select
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT'

      if (e.key === 'Enter') {
        if (buffer.current.length > 2) {
          // Fast input (scanner): interval < 50ms between keys
          handleScan(buffer.current)
        }
        buffer.current = ''
        return
      }

      if (e.key === 'F2') {
        e.preventDefault()
        searchRef?.current?.focus()
        buffer.current = ''
        return
      }

      if (isInput) {
        buffer.current = ''
        return
      }

      // Accumulate chars quickly typed (scanner)
      const interval = now - lastKeyTime.current
      if (e.key.length === 1) {
        if (interval < 100) {
          buffer.current += e.key
        } else {
          // Slow typing = user on keyboard, route to search
          buffer.current = e.key
        }
      }
      lastKeyTime.current = now
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleScan, searchRef])

  return null
}
