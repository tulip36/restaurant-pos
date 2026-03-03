import { getDb } from './db'

export interface Category {
  id: number
  name: string
  name_en?: string
  description?: string
  sort_order: number
  is_active: number
  created_at: string
  updated_at: string
}

export interface CreateCategoryInput {
  name: string
  name_en?: string
  description?: string
  sortOrder?: number
}

export interface UpdateCategoryInput {
  name?: string
  name_en?: string
  description?: string
  sortOrder?: number
  isActive?: boolean
}

export function createCategory(input: CreateCategoryInput): Category {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO categories (name, name_en, description, sort_order)
    VALUES (?, ?, ?, ?)
  `)
  const result = stmt.run(
    input.name,
    input.name_en || null,
    input.description || null,
    input.sortOrder || 0
  )
  return getCategoryById(result.lastInsertRowid as number)!
}

export function getCategories(): Category[] {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order, id')
  return stmt.all() as Category[]
}

export function getCategoryById(id: number): Category | null {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM categories WHERE id = ?')
  return (stmt.get(id) as Category) || null
}

export function updateCategory(id: number, input: UpdateCategoryInput): Category | null {
  const db = getDb()
  const current = getCategoryById(id)
  if (!current) return null

  const stmt = db.prepare(`
    UPDATE categories SET
      name = ?,
      name_en = ?,
      description = ?,
      sort_order = ?,
      is_active = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
  stmt.run(
    input.name ?? current.name,
    input.name_en ?? current.name_en,
    input.description ?? current.description,
    input.sortOrder ?? current.sort_order,
    input.isActive !== undefined ? (input.isActive ? 1 : 0) : current.is_active,
    id
  )
  return getCategoryById(id)
}

export function deleteCategory(id: number): boolean {
  const db = getDb()
  const stmt = db.prepare('UPDATE categories SET is_active = 0 WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}

export default { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory }
