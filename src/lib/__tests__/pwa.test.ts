import { describe, it, expect } from 'vitest'

describe('PWA', () => {
  it('should have pwa module exports', async () => {
    // Test that the module can be imported
    const pwa = await import('../pwa')
    expect(pwa.isOffline).toBeDefined()
    expect(pwa.getOnlineStatus).toBeDefined()
    expect(pwa.registerServiceWorker).toBeDefined()
    expect(pwa.setupOfflineListener).toBeDefined()
  })

  it('should have manifest.json', async () => {
    const fs = await import('fs')
    const manifest = fs.readFileSync('./public/manifest.json', 'utf-8')
    const parsed = JSON.parse(manifest)
    expect(parsed.name).toBe('Restaurant POS')
  })

  it('should have service worker', async () => {
    const fs = await import('fs')
    const sw = fs.readFileSync('./public/sw.js', 'utf-8')
    expect(sw).toContain('CACHE_NAME')
    expect(sw).toContain('fetch')
  })
})
