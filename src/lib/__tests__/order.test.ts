import { describe, it, expect, beforeEach } from 'vitest'
import { initDb } from '../db'
import { createCategory } from '../category'
import { createMenuItem } from '../menu-item'
import { createOrder, getOrderById, getOrders, updateOrderStatus, getOrdersByStatus } from '../order'

describe('Order', () => {
  let categoryId: number, menuItemId: number
  
  beforeEach(() => {
    initDb('./test-order.db')
    const cat = createCategory({ name: '川菜' })
    categoryId = cat.id
    const item = createMenuItem({ categoryId, name: '宫保鸡丁', price: 1599 })
    menuItemId = item.id
  })

  it('should create an order', () => {
    const order = createOrder({
      items: [{ menuItemId, quantity: 2, unitPrice: 1599 }],
      tableNumber: '01',
      orderType: 'dine_in',
    })
    expect(order.id).toBeDefined()
    expect(order.order_number).toBeDefined()
    expect(order.status).toBe('pending')
    // subtotal = 3198, tax = 280 (8.75%), total = 3478
    expect(order.total).toBe(3478)
    expect(order.subtotal).toBe(3198)
  })

  it('should get orders', () => {
    createOrder({ items: [{ menuItemId, quantity: 1, unitPrice: 1599 }], orderType: 'dine_in' })
    const orders = getOrders()
    expect(orders.length).toBeGreaterThanOrEqual(1)
  })

  it('should update order status', () => {
    const order = createOrder({ items: [{ menuItemId, quantity: 1, unitPrice: 1599 }], orderType: 'dine_in' })
    const updated = updateOrderStatus(order.id, 'preparing')
    expect(updated?.status).toBe('preparing')
  })

  it('should get orders by status', () => {
    createOrder({ items: [{ menuItemId, quantity: 1, unitPrice: 1599 }], orderType: 'dine_in' })
    const pending = getOrdersByStatus('pending')
    expect(pending.length).toBeGreaterThanOrEqual(1)
  })
})
