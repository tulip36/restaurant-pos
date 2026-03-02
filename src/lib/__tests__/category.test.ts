import { describe, it, expect, beforeEach } from 'vitest'
import { getDb, initDb } from '../db'
import { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory } from '../category'

describe('Category', () => {
  beforeEach(() => {
    initDb('./test-category.db')
  })

  it('should create a category', () => {
    const category = createCategory({ name: '川菜', name_en: 'Sichuan', description: '四川菜', sortOrder: 1 })
    expect(category.id).toBeDefined()
    expect(category.name).toBe('川菜')
  })

  it('should get all categories', () => {
    createCategory({ name: '川菜', name_en: 'Sichuan' })
    createCategory({ name: '粤菜', name_en: 'Cantonese' })
    const categories = getCategories()
    expect(categories.length).toBeGreaterThanOrEqual(2)
  })

  it('should get category by id', () => {
    const created = createCategory({ name: '测试分类' })
    const found = getCategoryById(created.id)
    expect(found?.name).toBe('测试分类')
  })

  it('should update category', () => {
    const created = createCategory({ name: '旧名称' })
    const updated = updateCategory(created.id, { name: '新名称' })
    expect(updated?.name).toBe('新名称')
  })

  it('should soft delete category', () => {
    const created = createCategory({ name: '待删除' })
    const result = deleteCategory(created.id)
    expect(result).toBe(true)
    // Soft delete - category still exists but inactive
    const found = getCategoryById(created.id)
    expect(found?.is_active).toBe(0)
  })
})
