import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Database from 'better-sqlite3'
import { initDb, getDb } from '../db'

describe('Database', () => {
  const testDbPath = './test.db'

  beforeAll(() => {
    process.env.DATABASE_URL = testDbPath
  })

  afterAll(() => {
    try {
      const fs = require('fs')
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath)
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  })

  it('should initialize database connection', () => {
    const db = initDb(testDbPath)
    expect(db).toBeDefined()
    expect(db instanceof Database).toBe(true)
  })

  it('should return the same database instance', () => {
    const db1 = getDb()
    const db2 = getDb()
    expect(db1).toBe(db2)
  })

  it('should create tables', () => {
    const db = getDb()
    
    const categories = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='categories'").get()
    expect(categories).toBeDefined()
    
    const menuItems = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='menu_items'").get()
    expect(menuItems).toBeDefined()
    
    const orders = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='orders'").get()
    expect(orders).toBeDefined()
    
    const orderItems = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='order_items'").get()
    expect(orderItems).toBeDefined()
    
    const customers = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='customers'").get()
    expect(customers).toBeDefined()
  })
})
