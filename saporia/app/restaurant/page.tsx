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
    <div className="bg-gray-50 min-h-screen">
      <Navbar user={user} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">Restaurant Dashboard</h1>

        <h2 className="text-xl font-semibold mb-3 text-gray-800">Menu</h2>
        <div className="flex flex-wrap gap-6 mb-8">
          {menu.length === 0 && <div className="text-gray-400">No menu items.</div>}
          {menu.map(item => (
            <Card key={item.id} className="w-64">
              <div className="font-medium text-lg mb-1">{item.name}</div>
              <div className="text-gray-700">₹{item.price}</div>
            </Card>
          ))}
        </div>

        <h2 className="text-xl font-semibold mb-3 text-gray-800">Orders</h2>
        <div className="space-y-4">
          {orders.length === 0 && <div className="text-gray-400">No orders yet.</div>}
          {orders.map(o => (
            <Card key={o.id} className="bg-gray-100">
              <div className="mb-1"><b>Order:</b> {o.id}</div>
              <div className="mb-1"><b>Status:</b> {o.status}</div>
              {o.status === "PENDING_RESTAURANT" && (
                <Button onClick={() => acceptOrder(o.id)} className="mt-2">Accept</Button>
              )}
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}