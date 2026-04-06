"use client"

import { useEffect, useState } from "react"

export default function DeliveryPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)

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

  useEffect(() => {
    loadOrders()
  }, [])

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
    <div style={{ padding: 20 }}>
      <h1>Delivery Dashboard</h1>
      {orders.map(o => (
        <div key={o.id} style={{ marginBottom: 8 }}>
          Order: {o.id} | Restaurant: {o.restaurantId}
          <button onClick={() => acceptDelivery(o.id)} style={{ marginLeft: 8 }}>
            Accept Delivery
          </button>
        </div>
      ))}
    </div>
  )
}
