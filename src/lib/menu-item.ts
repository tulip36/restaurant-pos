import { getDb } from './db'

export interface MenuItem {
  id: number
  category_id: number
  name: string
  name_en?: string
  description?: string
  description_en?: string
  price: number
  image_url?: string
  is_available: number
  is_active: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CreateMenuItemInput {
  categoryId: number
  name: string
  name_en?: string
  description?: string
  description_en?: string
  price: number
  imageUrl?: string
  sortOrder?: number
}

export interface UpdateMenuItemInput {
  name?: string
  name_en?: string
  description?: string
  description_en?: string
  price?: number
  imageUrl?: string
  isAvailable?: boolean
  isActive?: boolean
  sortOrder?: number
}

export function createMenuItem(input: CreateMenuItemInput): MenuItem {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO menu_items (category_id, name, name_en, description, description_en, price, image_url, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const result = stmt.run(
    input.categoryId,
    input.name,
    input.name_en || null,
    input.description || null,
    input.description_en || null,
    input.price,
    input.imageUrl || null,
    input.sortOrder || 0
  )
  return getMenuItemById(result.lastInsertRowid as number)!
}

export function getMenuItems(): MenuItem[] {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM menu_items WHERE is_active = 1 ORDER BY sort_order, id')
  return stmt.all() as MenuItem[]
}

export function getMenuItemById(id: number): MenuItem | null {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM menu_items WHERE id = ?')
  return (stmt.get(id) as MenuItem) || null
}

export function getMenuItemsByCategory(categoryId: number): MenuItem[] {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM menu_items WHERE category_id = ? AND is_active = 1 ORDER BY sort_order, id')
  return stmt.all(categoryId) as MenuItem[]
}

export function updateMenuItem(id: number, input: UpdateMenuItemInput): MenuItem | null {
  const db = getDb()
  const current = getMenuItemById(id)
  if (!current) return null

  const stmt = db.prepare(`
    UPDATE menu_items SET
      name = ?, name_en = ?, description = ?, description_en = ?,
      price = ?, image_url = ?, is_available = ?, is_active = ?, sort_order = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
  stmt.run(
    input.name ?? current.name,
    input.name_en ?? current.name_en,
    input.description ?? current.description,
    input.description_en ?? current.description_en,
    input.price ?? current.price,
    input.imageUrl ?? current.image_url,
    input.isAvailable !== undefined ? (input.isAvailable ? 1 : 0) : current.is_available,
    input.isActive !== undefined ? (input.isActive ? 1 : 0) : current.is_active,
    input.sortOrder ?? current.sort_order,
    id
  )
  return getMenuItemById(id)
}

export function toggleAvailability(id: number): MenuItem | null {
  const current = getMenuItemById(id)
  if (!current) return null
  return updateMenuItem(id, { isAvailable: current.is_available === 0 })
}

export function deleteMenuItem(id: number): boolean {
  const db = getDb()
  const stmt = db.prepare('UPDATE menu_items SET is_active = 0 WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}

export default { createMenuItem, getMenuItems, getMenuItemById, getMenuItemsByCategory, updateMenuItem, toggleAvailability, deleteMenuItem }
