import { describe, it, expect, beforeEach } from 'vitest'
import { initDb } from '../db'
import { createCustomer, getCustomerByPhone, addLoyaltyPoints, getCustomerById } from '../customer'

describe('Customer', () => {
  beforeEach(() => {
    initDb('./test-customer.db')
  })

  it('should create a customer', () => {
    const customer = createCustomer({ name: '张三', phone: '1234567890' })
    expect(customer.id).toBeDefined()
    expect(customer.name).toBe('张三')
    expect(customer.loyalty_points).toBe(0)
  })

  it('should get customer by phone', () => {
    createCustomer({ name: '李四', phone: '9876543210' })
    const customer = getCustomerByPhone('9876543210')
    expect(customer?.name).toBe('李四')
  })

  it('should add loyalty points', () => {
    const customer = createCustomer({ name: '王五', phone: '111222333' })
    const updated = addLoyaltyPoints(customer.id, 100)
    expect(updated?.loyalty_points).toBe(100)
  })

  it('should accumulate loyalty points', () => {
    const customer = createCustomer({ name: '赵六', phone: '444555666' })
    addLoyaltyPoints(customer.id, 50)
    addLoyaltyPoints(customer.id, 30)
    const final = getCustomerById(customer.id)
    expect(final?.loyalty_points).toBe(80)
  })
})
