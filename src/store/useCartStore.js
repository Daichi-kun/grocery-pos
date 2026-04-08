import { create } from 'zustand'

export const useCartStore = create((set, get) => ({
  items: [],
  discount: 0,
  paymentMethod: 'cash',
  note: '',

  addItem: (product, quantity = 1) => {
    const { items } = get()
    const existing = items.find(i => i.product_id === product.id)

    if (existing) {
      set({
        items: items.map(i =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + quantity, line_total: (i.quantity + quantity) * i.unit_price }
            : i
        )
      })
    } else {
      set({
        items: [...items, {
          product_id:      product.id,
          product_name:    product.name,
          product_barcode: product.barcode,
          unit_price:      product.price,
          unit_cost:       product.cost || 0,
          quantity,
          discount_amount: 0,
          line_total:      product.price * quantity,
        }]
      })
    }
  },

  removeItem: (product_id) => {
    set({ items: get().items.filter(i => i.product_id !== product_id) })
  },

  updateQuantity: (product_id, quantity) => {
    if (quantity <= 0) {
      set({ items: get().items.filter(i => i.product_id !== product_id) })
      return
    }
    set({
      items: get().items.map(i =>
        i.product_id === product_id
          ? { ...i, quantity, line_total: quantity * i.unit_price - i.discount_amount }
          : i
      )
    })
  },

  applyItemDiscount: (product_id, discountAmount) => {
    set({
      items: get().items.map(i =>
        i.product_id === product_id
          ? { ...i, discount_amount: discountAmount, line_total: i.quantity * i.unit_price - discountAmount }
          : i
      )
    })
  },

  setDiscount: (discount) => set({ discount }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setNote: (note) => set({ note }),

  clearCart: () => set({ items: [], discount: 0, paymentMethod: 'cash', note: '' }),

  // Computed
  getSubtotal: () => {
    return get().items.reduce((sum, i) => sum + i.line_total, 0)
  },

  getTotal: () => {
    const subtotal = get().getSubtotal()
    return Math.max(0, subtotal - get().discount)
  },
}))
