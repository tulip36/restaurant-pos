'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { 
  getCategories, getMenuItemsByCategory, getMenuItems, 
  type Category, type MenuItem 
} from '@/lib/category'
import { initDb } from '@/lib/db'

// Initialize database on client side
if (typeof window !== 'undefined') {
  initDb('./restaurant.db')
}

export default function POSPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [cart, setCart] = useState<{item: MenuItem, quantity: number}[]>([])
  const [tableNumber, setTableNumber] = useState('01')
  const [language, setLanguage] = useState<'zh' | 'en'>('en')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const cats = getCategories()
    setCategories(cats)
    if (cats.length > 0) {
      setSelectedCategory(cats[0].id)
    }
    setMenuItems(getMenuItems())
  }

  const getFilteredItems = () => {
    if (!selectedCategory) return menuItems
    return menuItems.filter(item => item.category_id === selectedCategory && item.is_available === 1)
  }

  const addToCart = (item: MenuItem) => {
    const existing = cart.find(c => c.item.id === item.id)
    if (existing) {
      setCart(cart.map(c => 
        c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ))
    } else {
      setCart([...cart, { item, quantity: 1 }])
    }
  }

  const removeFromCart = (itemId: number) => {
    const existing = cart.find(c => c.item.id === itemId)
    if (existing && existing.quantity > 1) {
      setCart(cart.map(c => 
        c.item.id === itemId ? { ...c, quantity: c.quantity - 1 } : c
      ))
    } else {
      setCart(cart.filter(c => c.item.id !== itemId))
    }
  }

  const getCartTotal = () => {
    return cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0) / 100
  }

  const t = (zh: string, en: string) => language === 'zh' ? zh : en

  return (
    <div className="h-screen flex flex-col bg-amber-50">
      {/* Header */}
      <header className="bg-red-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">🏠 {t('点餐系统', 'POS System')}</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lg">{new Date().toLocaleTimeString()}</span>
          <Button 
            variant="outline" 
            className="bg-white text-red-600 border-white hover:bg-red-50"
            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
          >
            🌐 {language === 'zh' ? 'EN' : '中文'}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-40 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="text-2xl font-bold text-red-600">LOGO</div>
          </div>
          
          <nav className="flex-1 p-2 space-y-1">
            <Button variant="ghost" className="w-full justify-start bg-red-50 text-red-700">
              🍽️ {t('点餐', 'Order')}
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              📺 KDS
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              📋 {t('订单', 'Orders')}
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              📊 {t('报表', 'Reports')}
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              👥 {t('客户', 'Customers')}
            </Button>
          </nav>

          <div className="p-2 border-t">
            <Button variant="ghost" className="w-full justify-start">
              ⚙️ {t('设置', 'Settings')}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Category Tabs */}
          <div className="bg-white px-4 py-2 border-b">
            <Tabs value={String(selectedCategory)} onValueChange={(v) => setSelectedCategory(Number(v))}>
              <TabsList className="flex flex-wrap gap-1">
                {categories.map(cat => (
                  <TabsTrigger key={cat.id} value={String(cat.id)}>
                    {language === 'zh' ? cat.name : (cat.name_en || cat.name)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Menu Items Grid */}
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-4 gap-4">
              {getFilteredItems().map(item => (
                <Card 
                  key={item.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => addToCart(item)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="h-24 bg-gray-100 rounded mb-2 flex items-center justify-center text-4xl">
                      🍜
                    </div>
                    <div className="font-medium">
                      {language === 'zh' ? item.name : (item.name_en || item.name)}
                    </div>
                    <div className="text-red-600 font-bold">
                      ${(item.price / 100).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="bg-white border-t px-4 py-3 flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline">📋 {t('挂单', 'Hold')}</Button>
              <Button variant="outline">🚚 {t('外卖', 'Takeout')}</Button>
              <Button variant="outline">➕ {t('加菜', 'Add')}</Button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg">{t('桌号', 'Table')}: {tableNumber}</span>
              <span className="text-2xl font-bold text-red-600">
                ${getCartTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </main>

        {/* Cart Sidebar */}
        <aside className="w-80 bg-white border-l flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-bold text-lg">🛒 {t('购物车', 'Cart')}</h2>
            <Badge variant="secondary">{cart.length} {t('项', 'items')}</Badge>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                {t('购物车为空', 'Cart is empty')}
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map(({ item, quantity }) => (
                  <Card key={item.id}>
                    <CardContent className="p-3 flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          {language === 'zh' ? item.name : (item.name_en || item.name)}
                        </div>
                        <div className="text-sm text-gray-500">
                          ${(item.price / 100).toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => removeFromCart(item.id)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{quantity}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => addToCart(item)}
                        >
                          +
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t">
            <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
              {t('确认下单', 'Place Order')}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
