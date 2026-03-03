import { getDb } from './db'

export interface Customer {
  id: number
  name?: string
  phone?: string
  email?: string
  loyalty_points: number
  created_at: string
  updated_at: string
}

export interface CreateCustomerInput {
  name?: string
  phone?: string
  email?: string
}

export interface UpdateCustomerInput {
  name?: string
  phone?: string
  email?: string
  loyaltyPoints?: number
}

export function createCustomer(input: CreateCustomerInput): Customer {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO customers (name, phone, email)
    VALUES (?, ?, ?)
  `)
  const result = stmt.run(input.name || null, input.phone || null, input.email || null)
  return getCustomerById(result.lastInsertRowid as number)!
}

export function getCustomers(limit = 50): Customer[] {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM customers ORDER BY created_at DESC LIMIT ?')
  return stmt.all(limit) as Customer[]
}

export function getCustomerById(id: number): Customer | null {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM customers WHERE id = ?')
  return (stmt.get(id) as Customer) || null
}

export function getCustomerByPhone(phone: string): Customer | null {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM customers WHERE phone = ?')
  return (stmt.get(phone) as Customer) || null
}

export function updateCustomer(id: number, input: UpdateCustomerInput): Customer | null {
  const db = getDb()
  const current = getCustomerById(id)
  if (!current) return null

  const stmt = db.prepare(`
    UPDATE customers SET name = ?, phone = ?, email = ?, loyalty_points = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
  stmt.run(
    input.name ?? current.name,
    input.phone ?? current.phone,
    input.email ?? current.email,
    input.loyaltyPoints ?? current.loyalty_points,
    id
  )
  return getCustomerById(id)
}

export function addLoyaltyPoints(id: number, points: number): Customer | null {
  const current = getCustomerById(id)
  if (!current) return null
  return updateCustomer(id, { loyaltyPoints: current.loyalty_points + points })
}

export function deleteCustomer(id: number): boolean {
  const db = getDb()
  const stmt = db.prepare('DELETE FROM customers WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}

export default { createCustomer, getCustomers, getCustomerById, getCustomerByPhone, updateCustomer, addLoyaltyPoints, deleteCustomer }
