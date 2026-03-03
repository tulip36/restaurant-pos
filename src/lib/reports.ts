import { getDb } from './db'

export interface SalesReport {
  date: string
  total_orders: number
  total_revenue: number
  avg_order_value: number
}

export interface PopularItem {
  menu_item_id: number
  name: string
  total_sold: number
  total_revenue: number
}

export interface CustomerReport {
  total_customers: number
  new_customers: number
  returning_customers: number
  avg_order_per_customer: number
}

export function getSalesReport(startDate?: string, endDate?: string): SalesReport[] {
  const db = getDb()
  
  let query = `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as total_orders,
      SUM(total) as total_revenue,
      AVG(total) as avg_order_value
    FROM orders
    WHERE status NOT IN ('cancelled')
  `
  
  const params: string[] = []
  
  if (startDate) {
    query += ' AND DATE(created_at) >= ?'
    params.push(startDate)
  }
  if (endDate) {
    query += ' AND DATE(created_at) <= ?'
    params.push(endDate)
  }
  
  query += ' GROUP BY DATE(created_at) ORDER BY date DESC'
  
  const stmt = db.prepare(query)
  return stmt.all(...params) as SalesReport[]
}

export function getPopularItems(limit = 10): PopularItem[] {
  const db = getDb()
  
  const query = `
    SELECT 
      oi.menu_item_id,
      mi.name,
      SUM(oi.quantity) as total_sold,
      SUM(oi.subtotal) as total_revenue
    FROM order_items oi
    JOIN menu_items mi ON oi.menu_item_id = mi.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status NOT IN ('cancelled')
    GROUP BY oi.menu_item_id
    ORDER BY total_sold DESC
    LIMIT ?
  `
  
  const stmt = db.prepare(query)
  return stmt.all(limit) as PopularItem[]
}

export function getCustomerReport(): CustomerReport {
  const db = getDb()
  
  const totalStmt = db.prepare('SELECT COUNT(*) as count FROM customers')
  const total = (totalStmt.get() as { count: number }).count
  
  const today = new Date().toISOString().split('T')[0]
  const newStmt = db.prepare('SELECT COUNT(*) as count FROM customers WHERE DATE(created_at) = ?')
  const newCustomers = (newStmt.get(today) as { count: number }).count
  
  const avgStmt = db.prepare(`
    SELECT AVG(order_count) as avg
    FROM (
      SELECT customer_id, COUNT(*) as order_count
      FROM orders
      WHERE customer_id IS NOT NULL
      GROUP BY customer_id
    )
  `)
  const avgResult = avgStmt.get() as { avg: number | null }
  const avgOrderPerCustomer = avgResult.avg || 0
  
  return {
    total_customers: total,
    new_customers: newCustomers,
    returning_customers: total - newCustomers,
    avg_order_per_customer: Math.round(avgOrderPerCustomer * 100) / 100,
  }
}

export function getTodayStats(): { orders: number; revenue: number } {
  const db = getDb()
  const today = new Date().toISOString().split('T')[0]
  
  const stmt = db.prepare(`
    SELECT COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue
    FROM orders
    WHERE DATE(created_at) = ? AND status NOT IN ('cancelled')
  `)
  
  const result = stmt.get(today) as { orders: number; revenue: number }
  return result
}

export default { getSalesReport, getPopularItems, getCustomerReport, getTodayStats }
