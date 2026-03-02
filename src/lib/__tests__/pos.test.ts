import { describe, it, expect } from 'vitest'
import { initDb } from '../db'
import * as category from '../category'
import * as menuItem from '../menu-item'

describe('POS Data Setup', () => {
  it('should setup sample data for POS', () => {
    initDb('./test-pos.db')
    
    // Create categories
    const cat1 = category.createCategory({ name: '川菜', name_en: 'Sichuan' })
    const cat2 = category.createCategory({ name: '粤菜', name_en: 'Cantonese' })
    
    // Create menu items
    const item1 = menuItem.createMenuItem({ categoryId: cat1.id, name: '宫保鸡丁', name_en: 'Kung Pao Chicken', price: 1599 })
    
    expect(cat1.id).toBeDefined()
    expect(item1.id).toBeDefined()
    expect(item1.price).toBe(1599)
  })
})
