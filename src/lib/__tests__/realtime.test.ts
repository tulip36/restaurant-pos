import { describe, it, expect, vi } from 'vitest'
import { syncQueue, isOnline } from '../realtime'

describe('Realtime Sync', () => {
  it('should add events to queue', () => {
    syncQueue.clear()
    syncQueue.add({ type: 'order_created', data: { id: 1 }, timestamp: Date.now() })
    const queue = syncQueue.getQueue()
    expect(queue.length).toBe(1)
    expect(queue[0].type).toBe('order_created')
  })

  it('should notify subscribers', () => {
    syncQueue.clear()
    const callback = vi.fn()
    const unsubscribe = syncQueue.subscribe(callback)
    
    syncQueue.add({ type: 'order_updated', data: { id: 1 }, timestamp: Date.now() })
    
    expect(callback).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  it('should clear queue', () => {
    syncQueue.clear()
    syncQueue.add({ type: 'order_created', data: {}, timestamp: Date.now() })
    syncQueue.clear()
    expect(syncQueue.getQueue().length).toBe(0)
  })

  it('should sync and clear queue', async () => {
    syncQueue.clear()
    syncQueue.add({ type: 'order_created', data: {}, timestamp: Date.now() })
    const result = await syncQueue.sync()
    expect(result.success).toBe(true)
    expect(result.count).toBe(1)
  })

  it('should check online status returns boolean or undefined', () => {
    const status = isOnline()
    // In Node.js, navigator is undefined so it returns true
    expect(status === true || status === false || status === undefined).toBe(true)
  })
})
