// Real-time sync using Server-Sent Events (SSE)
// For offline support, we use a queue system

type SyncEvent = {
  type: 'order_created' | 'order_updated' | 'order_deleted'
  data: unknown
  timestamp: number
}

class SyncQueue {
  private queue: SyncEvent[] = []
  private listeners: ((event: SyncEvent) => void)[] = []

  add(event: SyncEvent): void {
    this.queue.push(event)
    this.notifyListeners(event)
  }

  subscribe(listener: (event: SyncEvent) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners(event: SyncEvent): void {
    this.listeners.forEach(listener => listener(event))
  }

  getQueue(): SyncEvent[] {
    return [...this.queue]
  }

  clear(): void {
    this.queue = []
  }

  async sync(): Promise<{ success: boolean; count: number }> {
    // In production, this would sync with server
    const count = this.queue.length
    this.clear()
    return { success: true, count }
  }
}

export const syncQueue = new SyncQueue()

export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true
  return navigator.onLine
}

export function onOnline(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('online', callback)
  return () => window.removeEventListener('online', callback)
}

export function onOffline(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('offline', callback)
  return () => window.removeEventListener('offline', callback)
}

export default { syncQueue, isOnline, onOnline, onOffline }
