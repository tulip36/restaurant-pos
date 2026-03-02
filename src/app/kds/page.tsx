'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getOrdersByStatus, updateOrderStatus, getOrders, type Order } from '@/lib/order'
import { initDb } from '@/lib/db'
import { syncQueue } from '@/lib/realtime'

if (typeof window !== 'undefined') {
  initDb('./restaurant.db')
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500',
  preparing: 'bg-blue-500',
  ready: 'bg-green-500',
  completed: 'bg-gray-500',
  cancelled: 'bg-red-500',
}

const STATUS_LABELS: Record<string, { zh: string; en: string }> = {
  pending: { zh: '待接单', en: 'Pending' },
  preparing: { zh: '制作中', en: 'Preparing' },
  ready: { zh: '已完成', en: 'Ready' },
  completed: { zh: '已上菜', en: 'Served' },
  cancelled: { zh: '已取消', en: 'Cancelled' },
}

export default function KDSPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [language, setLanguage] = useState<'zh' | 'en'>('en')

  const loadOrders = () => {
    const pending = getOrdersByStatus('pending')
    const preparing = getOrdersByStatus('preparing')
    const ready = getOrdersByStatus('ready')
    setOrders([...pending, ...preparing, ...ready])
  }

  useEffect(() => {
    loadOrders()
    const unsubscribe = syncQueue.subscribe(() => loadOrders())
    const interval = setInterval(loadOrders, 5000) // Poll every 5s
    return () => { unsubscribe(); clearInterval(interval) }
  }, [])

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateOrderStatus(orderId as any, newStatus as any)
    syncQueue.add({ type: 'order_updated', data: { orderId, status: newStatus }, timestamp: Date.now() })
    loadOrders()
  }

  const t = (zh: string, en: string) => language === 'zh' ? zh : en

  const playSound = () => {
    const audio = new Audio('/notification.mp3')
    audio.play().catch(() => {})
  }

  const pendingCount = orders.filter(o => o.status === 'pending').length

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <header className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">📺 KDS - {t('厨房显示', 'Kitchen Display')}</h1>
        <div className="flex items-center gap-4">
          {pendingCount > 0 && (
            <Badge className="bg-red-500 text-white text-lg px-3 py-1 animate-pulse">
              🔔 {pendingCount} {t('新订单', 'New Orders')}
            </Badge>
          )}
          <span className="text-lg">{new Date().toLocaleTimeString()}</span>
          <Button variant="outline" className="text-black" onClick={() => setLanguage(l => l === 'zh' ? 'en' : 'zh')}>
            🌐 {language === 'zh' ? 'EN' : '中文'}
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-3 gap-4">
          {orders.length === 0 ? (
            <div className="col-span-3 text-center text-gray-400 py-20 text-2xl">
              {t('暂无订单', 'No orders')}
            </div>
          ) : (
            orders.map(order => (
              <Card key={order.id} className={`${STATUS_COLORS[order.status]} text-white`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-2xl font-bold">{order.table_number || '---'}</div>
                      <div className="text-sm opacity-80">{order.order_number}</div>
                    </div>
                    <Badge className="bg-white text-black">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </Badge>
                  </div>
                  
                  <div className="mb-3">
                    <Badge className={`${STATUS_COLORS[order.status]} text-white`}>
                      {STATUS_LABELS[order.status]?.[language] || order.status}
                    </Badge>
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="font-bold">{t('菜品', 'Items')}: {t('堂食', 'Dine-in')}</div>
                  </div>

                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusChange(order.id, 'preparing')}>
                        ▶ {t('接单', 'Accept')}
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange(order.id, 'ready')}>
                        ✓ {t('完成', 'Done')}
                      </Button>
                    )}
                    {order.status === 'ready' && (
                      <Button className="flex-1 bg-gray-600 hover:bg-gray-700" onClick={() => handleStatusChange(order.id, 'completed')}>
                        🎉 {t('上菜', 'Served')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
