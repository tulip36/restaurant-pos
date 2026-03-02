import { describe, it, expect, beforeEach } from 'vitest'
import { initDb } from '../db'
import { createCategory } from '../category'
import { createMenuItem } from '../menu-item'
import { createOrder, getOrdersByStatus, updateOrderStatus } from '../order'

describe('KDS', () => {
  let categoryId: number, menuItemId: number
  
  beforeEach(() => {
    initDb('./test-kds.db')
    const cat = createCategory({ name: '川菜' })
    categoryId = cat.id
    const item = createMenuItem({ categoryId, name: '宫保鸡丁', price: 1599 })
    menuItemId = item.id
  })

  it('should get pending orders for KDS', () => {
    createOrder({ items: [{ menuItemId, quantity: 1, unitPrice: 1599 }], orderType: 'dine_in' })
    const pending = getOrdersByStatus('pending')
    expect(pending.length).toBeGreaterThanOrEqual(1)
  })

  it('should get preparing orders', () => {
    const order = createOrder({ items: [{ menuItemId, quantity: 1, unitPrice: 1599 }], orderType: 'dine_in' })
    updateOrderStatus(order.id, 'preparing')
    const preparing = getOrdersByStatus('preparing')
    expect(preparing.length).toBeGreaterThanOrEqual(1)
  })

  it('should update order to ready', () => {
    const order = createOrder({ items: [{ menuItemId, quantity: 1, unitPrice: 1599 }], orderType: 'dine_in' })
    updateOrderStatus(order.id, 'preparing')
    updateOrderStatus(order.id, 'ready')
    const ready = getOrdersByStatus('ready')
    expect(ready[0]?.status).toBe('ready')
  })
})
