import { describe, it, expect, beforeEach } from 'vitest'
import { configurePlatform, isPlatformActive, getActivePlatforms, acceptPlatformOrder, type Platform } from '../integration'

// Reset state before each test
beforeEach(() => {
  configurePlatform('ubereats', { is_active: false })
  configurePlatform('doordash', { is_active: false })
  configurePlatform('grubhub', { is_active: false })
})

describe('Platform Integration', () => {
  it('should configure platform', () => {
    configurePlatform('ubereats', { is_active: true, api_key: 'test-key' })
    expect(isPlatformActive('ubereats')).toBe(true)
  })

  it('should get active platforms', () => {
    configurePlatform('doordash', { is_active: true })
    const active = getActivePlatforms()
    expect(active).toContain('doordash')
  })

  it('should return false for inactive platform', () => {
    expect(isPlatformActive('grubhub')).toBe(false)
  })

  it('should reject order from inactive platform', async () => {
    const result = await acceptPlatformOrder('ubereats', 'order-123')
    expect(result).toBe(false)
  })

  it('should accept order from active platform', async () => {
    configurePlatform('ubereats', { is_active: true })
    const result = await acceptPlatformOrder('ubereats', 'order-123')
    expect(result).toBe(true)
  })
})
