import { describe, it, expect, beforeEach } from 'vitest'
import { initDb } from '../db'
import { createCategory } from '../category'
import { createMenuItem, getMenuItems, getMenuItemById, getMenuItemsByCategory, updateMenuItem, deleteMenuItem, toggleAvailability } from '../menu-item'

describe('MenuItem', () => {
  let categoryId: number
  
  beforeEach(() => {
    initDb('./test-menu-item.db')
    const category = createCategory({ name: '川菜', name_en: 'Sichuan' })
    categoryId = category.id
  })

  it('should create a menu item', () => {
    const item = createMenuItem({
      categoryId,
      name: '宫保鸡丁',
      name_en: 'Kung Pao Chicken',
      description: '经典川菜',
      price: 1599,
    })
    expect(item.id).toBeDefined()
    expect(item.name).toBe('宫保鸡丁')
    expect(item.price).toBe(1599)
  })

  it('should get all menu items', () => {
    createMenuItem({ categoryId, name: '菜品1', price: 1000 })
    createMenuItem({ categoryId, name: '菜品2', price: 2000 })
    const items = getMenuItems()
    expect(items.length).toBeGreaterThanOrEqual(2)
  })

  it('should get menu items by category', () => {
    createMenuItem({ categoryId, name: '川菜1', price: 1000 })
    createMenuItem({ categoryId, name: '川菜2', price: 2000 })
    const items = getMenuItemsByCategory(categoryId)
    expect(items.length).toBe(2)
  })

  it('should update menu item', () => {
    const item = createMenuItem({ categoryId, name: '旧名称', price: 1000 })
    const updated = updateMenuItem(item.id, { name: '新名称', price: 2000 })
    expect(updated?.name).toBe('新名称')
    expect(updated?.price).toBe(2000)
  })

  it('should toggle availability', () => {
    const item = createMenuItem({ categoryId, name: '测试菜品', price: 1000 })
    expect(item.is_available).toBe(1)
    const toggled = toggleAvailability(item.id)
    expect(toggled?.is_available).toBe(0)
  })

  it('should soft delete menu item', () => {
    const item = createMenuItem({ categoryId, name: '待删除', price: 1000 })
    deleteMenuItem(item.id)
    const found = getMenuItemById(item.id)
    expect(found?.is_active).toBe(0)
  })
})
