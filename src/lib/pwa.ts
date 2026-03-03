// PWA offline support utilities

export function isOffline(): boolean {
  if (typeof navigator === 'undefined') return false
  return !navigator.onLine
}

export function getOnlineStatus(): boolean {
  if (typeof navigator === 'undefined') return true
  return navigator.onLine
}

export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Service Worker registration failed:', error)
      })
    })
  }
}

export function setupOfflineListener(callback: (isOffline: boolean) => void): () => void {
  const handleOnline = () => callback(false)
  const handleOffline = () => callback(true)
  
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

export default { isOffline, getOnlineStatus, registerServiceWorker, setupOfflineListener }
