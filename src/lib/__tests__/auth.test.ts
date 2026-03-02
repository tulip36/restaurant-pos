import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { hashPassword, verifyPassword, createToken, verifyToken } from '../auth'

describe('Auth', () => {
  const testPassword = 'testPassword123'
  const testToken = 'testToken456'

  it('should hash password', async () => {
    const hash = await hashPassword(testPassword)
    expect(hash).toBeDefined()
    expect(hash).not.toBe(testPassword)
    expect(hash.length).toBeGreaterThan(0)
  })

  it('should verify correct password', async () => {
    const hash = await hashPassword(testPassword)
    const isValid = await verifyPassword(testPassword, hash)
    expect(isValid).toBe(true)
  })

  it('should reject wrong password', async () => {
    const hash = await hashPassword(testPassword)
    const isValid = await verifyPassword('wrongPassword', hash)
    expect(isValid).toBe(false)
  })

  it('should create and verify JWT token', () => {
    const token = createToken({ userId: 1, role: 'admin' })
    expect(token).toBeDefined()
    
    const payload = verifyToken(token)
    expect(payload).toBeDefined()
    expect(payload?.userId).toBe(1)
    expect(payload?.role).toBe('admin')
  })

  it('should return null for invalid token', () => {
    const payload = verifyToken('invalid.token.here')
    expect(payload).toBeNull()
  })
})
