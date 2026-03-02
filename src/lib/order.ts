import { getDb } from './db'

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
export type OrderType = 'dine_in' | 'takeout' | 'delivery'

export interface Order {
  id: number
  order_number: string
  table_number?: string
  order_type: OrderType
  status: OrderStatus
  subtotal: number
  tax: number
  total: number
  customer_id?: number
  notes?: string
  source: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: number
  order_id: number
  menu_item_id: number
  quantity: number
  unit_price: number
  subtotal: number
  notes?: string
  status: OrderStatus
  created_at: string
}

export interface CreateOrderInput {
  items: { menuItemId: number; quantity: number; unitPrice: number; notes?: string }[]
  tableNumber?: string
  orderType: OrderType
  customerId?: number
  notes?: string
}

const TAX_RATE = 0.0875 // 8.75%

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

export function createOrder(input: CreateOrderInput): Order {
  const db = getDb()
  
  const subtotal = input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const tax = Math.round(subtotal * TAX_RATE)
  const total = subtotal + tax
  
  const orderNumber = generateOrderNumber()
  
  const orderStmt = db.prepare(`
    INSERT INTO orders (order_number, table_number, order_type, status, subtotal, tax, total, customer_id, notes, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  
  const result = orderStmt.run(
    orderNumber,
    input.tableNumber || null,
    input.orderType,
    'pending',
    subtotal,
    tax,
    total,
    input.customerId || null,
    input.notes || null,
    'pos'
  )
  
  const orderId = result.lastInsertRowid as number
  
  const itemStmt = db.prepare(`
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  
  for (const item of input.items) {
    const itemSubtotal = item.unitPrice * item.quantity
    itemStmt.run(orderId, item.menuItemId, item.quantity, item.unitPrice, itemSubtotal, item.notes || null)
  }
  
  return getOrderById(orderId)!
}

export function getOrderById(id: number): Order | null {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM orders WHERE id = ?')
  return (stmt.get(id) as Order) || null
}

export function getOrders(limit = 50): Order[] {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT ?')
  return stmt.all(limit) as Order[]
}

export function getOrdersByStatus(status: OrderStatus): Order[] {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC')
  return stmt.all(status) as Order[]
}

export function updateOrderStatus(id: number, status: OrderStatus): Order | null {
  const db = getDb()
  const stmt = db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
  stmt.run(status, id)
  return getOrderById(id)
}

export function getOrderItems(orderId: number): OrderItem[] {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?')
  return stmt.all(orderId) as OrderItem[]
}

export default { createOrder, getOrderById, getOrders, getOrdersByStatus, updateOrderStatus, getOrderItems }
