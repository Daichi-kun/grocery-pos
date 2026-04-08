import Modal from '../../components/ui/Modal'
import { useSettingsStore } from '../../store/useSettingsStore'
import toast from 'react-hot-toast'

export default function ReceiptModal({ open, onClose, sale }) {
  const sym = useSettingsStore(s => s.currencySym)
  const storeName = useSettingsStore(s => s.storeName)

  async function handlePrint() {
    try {
      const result = await window.electronAPI.printer.printReceipt(sale)
      if (result.success) {
        toast.success('Чек отправлен на печать')
      } else {
        toast.error(`Печать недоступна: ${result.reason}`)
      }
    } catch {
      toast.error('Ошибка печати')
    }
  }

  if (!sale) return null

  return (
    <Modal open={open} onClose={onClose} title="Чек" size="sm">
      <div className="font-mono text-sm space-y-1">
        <div className="text-center font-bold text-base mb-3">{storeName}</div>
        <div className="text-center text-gray-500 text-xs">
          {sale.sale_number} · {new Date(sale.created_at).toLocaleString('ru-RU')}
        </div>
        <div className="border-t border-dashed border-gray-300 my-3" />

        {sale.items?.map(item => (
          <div key={item.id} className="flex justify-between gap-2">
            <span className="flex-1 truncate">{item.product_name}</span>
            <span className="text-gray-500">{item.quantity}×{sym}{item.unit_price.toFixed(2)}</span>
            <span className="font-medium w-16 text-right">{sym}{item.line_total.toFixed(2)}</span>
          </div>
        ))}

        <div className="border-t border-dashed border-gray-300 my-3" />
        <div className="flex justify-between font-bold text-base">
          <span>ИТОГО</span>
          <span>{sym}{sale.total.toFixed(2)}</span>
        </div>
        {sale.cash_given && (
          <>
            <div className="flex justify-between text-gray-500">
              <span>Наличные</span><span>{sym}{sale.cash_given.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Сдача</span><span>{sym}{sale.change_given.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <button className="btn-secondary flex-1" onClick={handlePrint}>🖨️ Печать</button>
        <button className="btn-primary flex-1" onClick={onClose}>Новая продажа</button>
      </div>
    </Modal>
  )
}
