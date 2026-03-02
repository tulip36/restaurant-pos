import { describe, it, expect, beforeEach } from 'vitest'
import { initDb } from '../db'
import { createCategory } from '../category'
import { createMenuItem } from '../menu-item'
import { createOrder } from '../order'
import { createCustomer } from '../customer'
import { getPopularItems, getCustomerReport, getTodayStats } from '../reports'

describe('Reports', () => {
  let categoryId: number, menuItemId: number
  
  beforeEach(() => {
    initDb('./test-reports.db')
    const cat = createCategory({ name: '川菜' })
    categoryId = cat.id
    const item = createMenuItem({ categoryId, name: '宫保鸡丁', price: 1599 })
    menuItemId = item.id
  })

  it('should get popular items', () => {
    createOrder({ items: [{ menuItemId, quantity: 3, unitPrice: 1599 }], orderType: 'dine_in' })
    const popular = getPopularItems(5)
    expect(popular.length).toBeGreaterThanOrEqual(1)
    expect(popular[0].total_sold).toBe(3)
  })

  it('should get customer report', () => {
    createCustomer({ name: '测试客户', phone: '1234567890' })
    const report = getCustomerReport()
    expect(report.total_customers).toBeGreaterThanOrEqual(1)
  })

  it('should get today stats', () => {
    createOrder({ items: [{ menuItemId, quantity: 1, unitPrice: 1599 }], orderType: 'dine_in' })
    const stats = getTodayStats()
    expect(stats.orders).toBeGreaterThanOrEqual(1)
    expect(stats.revenue).toBeGreaterThan(0)
  })
})
