"use client"

import { useEffect, useState, useRef } from "react"
import { toast } from "react-hot-toast"
import Card from "@/components/Card"
import Button from "@/components/Button"
import Navbar from "@/components/Navbar"

export default function RestaurantPage() {
  const [menu, setMenu] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [restaurantRecord, setRestaurantRecord] = useState<any>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const u = localStorage.getItem("user")
    if (u) setUser(JSON.parse(u))
  }, [])

  // fetch restaurant record and menu for the logged-in restaurant user
  useEffect(() => {
    if (!user?.id) return
    fetch('/api/restaurants')
      .then(res => res.json())
      .then((list: any[]) => {
        const r = list.find(rt => rt.userId === user.id)
        if (r) {
          setRestaurantRecord(r)
          fetch(`/api/restaurants/${r.id}/menu`).then(res => res.json()).then(setMenu)
        } else {
          setMenu([])
        }
      })
  }, [user])

  // fetch orders
  const loadOrders = async () => {
    if (!restaurantRecord?.id) return
    const res = await fetch(`/api/orders?restaurantId=${restaurantRecord.id}`)
    const data = await res.json()
    setOrders(data)
  }

  useEffect(() => {
    if (restaurantRecord?.id) loadOrders()
  }, [restaurantRecord])

  // WebSocket for live restaurant notifications
  useEffect(() => {
    if (!user?.id) return
    const url = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/api/orders/ws?userId=${user.id}&role=${user.role}`
    let ws: WebSocket | null = null
    let opened = false
    try {
      ws = new WebSocket(url)
      const openTimer = setTimeout(() => {
        if (!opened) {
          console.warn('[restaurant] WS not opened, falling back to polling')
          loadOrders()
          const iv = setInterval(loadOrders, 3000)
          // @ts-ignore
          wsRef.current = { iv }
        }
      }, 2000)
      ws.onopen = () => { opened = true; clearTimeout(openTimer) }
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'order:new') {
          toast.success('New order received')
          loadOrders()
        }
      }
      wsRef.current = ws
    } catch (err) {
      console.warn('[restaurant] WS creation failed, starting polling', err)
      loadOrders()
      const iv = setInterval(loadOrders, 3000)
      // @ts-ignore
      wsRef.current = { iv }
    }
    return () => {
      try { if (ws && ws.readyState === 1) ws.close() } catch (e) {}
      // clear polling interval if any
      // @ts-ignore
      if (wsRef.current?.iv) clearInterval(wsRef.current.iv)
    }
  }, [user])

  // accept order
  const acceptOrder = async (orderId: string) => {
    await fetch("/api/orders/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId })
    })
    loadOrders()
  }

  return (
    <div className="bg-[#fff8f6] min-h-screen font-sans">
      <Navbar user={user} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">Restaurant Dashboard</h1>

        <h2 className="text-xl font-semibold mb-4 text-gray-900 tracking-tight">
          Menu
        </h2>

        <div className="flex flex-wrap gap-6 mb-8">
          {menu.length === 0 && (
            <div className="text-gray-400 text-sm">No menu items.</div>
          )}

          {menu.map(item => (
            <Card
              key={item.id}
              className="
                w-64 p-0 overflow-hidden
                border border-gray-200/60
                hover:shadow-xl hover:-translate-y-1
                transition-all duration-300
              "
            >
              {/* Image placeholder (safe, no backend dependency) */}
              <div className="h-28 bg-linear-to-br from-red-100 to-red-50" />
          
              {/* Content */}
              <div className="p-4 space-y-2">
                <div className="font-medium text-gray-900 leading-tight">
                  {item.name}
                </div>
          
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    ₹{item.price}
                  </div>
          
                  {/* Static veg badge (optional visual polish) */}
                  <div className="text-[10px] px-2 py-0.5 rounded bg-green-100 text-green-700">
                    Veg
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 tracking-tight">
          Orders
        </h2>

        <div className="space-y-4">
          {orders.length === 0 && (
            <div className="text-gray-400 text-sm">No orders yet.</div>
          )}
        
          {orders.map(o => (
            <Card
              key={o.id}
              className="
                p-4
                border border-gray-200/60
                bg-white/80 backdrop-blur-sm
                shadow-[0_4px_16px_rgba(0,0,0,0.05)]
              "
            >
              {/* Top Row */}
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium text-gray-900">
                  Order #{o.id}
                </div>
          
                {/* Status badge */}
                <div className="
                  text-xs px-2.5 py-1 rounded-full
                  bg-yellow-100 text-yellow-700 font-medium
                ">
                  {o.status}
                </div>
              </div>
          
              {/* Action */}
              {o.status === "PENDING_RESTAURANT" && (
                <div className="mt-3">
                  <Button
                    onClick={() => acceptOrder(o.id)}
                    className="
                      w-full
                      bg-green-600 hover:bg-green-700
                      text-white
                    "
                  >
                    Accept Order
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}