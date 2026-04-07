"use client"

import { useEffect, useState, useRef } from "react"
import { toast } from "react-hot-toast"
import Card from "@/components/Card"
import Button from "@/components/Button"
import Navbar from "@/components/Navbar"

export default function DeliveryPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const u = localStorage.getItem("user")
    if (u) setUser(JSON.parse(u))
  }, [])

  // fetch available orders
  const loadOrders = async () => {
    const res = await fetch("/api/orders?status=PENDING_DELIVERY")
    const data = await res.json()
    setOrders(data)
  }

  const [restaurants, setRestaurants] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/restaurants').then(r => r.json()).then(setRestaurants)
  }, [])

  useEffect(() => {
    loadOrders()
  }, [])

  // WebSocket for delivery agents to get notified about accepted orders
  useEffect(() => {
    if (!user?.id) return
    const url = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/api/orders/ws?userId=${user.id}&role=${user.role}`
    let ws: WebSocket | null = null
    let opened = false
    try {
      ws = new WebSocket(url)
      const openTimer = setTimeout(() => {
        if (!opened) {
    useEffect(() => {
      fetch('/api/restaurants').then(r => r.json()).then(setRestaurants)
    }, [])
          console.warn('[delivery] WS not opened, falling back to polling')
          loadOrders()
          const iv = setInterval(loadOrders, 3000)
          // @ts-ignore
          wsRef.current = { iv }
        }
      }, 2000)
      ws.onopen = () => { opened = true; clearTimeout(openTimer) }
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'order:accepted') {
          toast.success('New delivery available')
          loadOrders()
        }
      }
      wsRef.current = ws
    } catch (err) {
      console.warn('[delivery] WS creation failed, starting polling', err)
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

  // accept delivery
  const acceptDelivery = async (orderId: string) => {
    if (!user?.id) return
    await fetch("/api/orders/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, deliveryAgentId: user.id })
    })
    loadOrders()
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar user={user} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">Delivery Dashboard</h1>
        <div className="space-y-4">
          {orders.length === 0 && <div className="text-gray-400">No orders available.</div>}
          {orders.map(o => (
            <Card key={o.id} className="bg-gray-100">
              <div className="mb-1"><b>Order:</b> {o.id}</div>
              <div className="mb-1"><b>Restaurant:</b> {o.restaurantId}</div>
              <Button onClick={() => acceptDelivery(o.id)} className="mt-2">Accept Delivery</Button>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
