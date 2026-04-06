"use client"

import { useEffect, useState } from "react"

export default function RestaurantPage() {
  const [menu, setMenu] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const u = localStorage.getItem("user")
    if (u) setUser(JSON.parse(u))
  }, [])

  // fetch menu
  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/restaurants/${user.id}/menu`)
      .then(res => res.json())
      .then(setMenu)
  }, [user])

  // fetch orders
  const loadOrders = async () => {
    if (!user?.id) return
    const res = await fetch(`/api/orders?restaurantId=${user.id}`)
    const data = await res.json()
    setOrders(data)
  }

  useEffect(() => {
    if (user?.id) loadOrders()
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
    <div style={{ padding: 20 }}>
      <h1>Restaurant Dashboard</h1>

      <h2>Menu</h2>
      {menu.map(item => (
        <div key={item.id}>{item.name} - ₹{item.price}</div>
      ))}

      <h2>Orders</h2>
      {orders.map(o => (
        <div key={o.id} style={{ marginBottom: 8 }}>
          Order: {o.id} | Status: {o.status}
          {o.status === "PENDING_RESTAURANT" && (
            <button onClick={() => acceptOrder(o.id)} style={{ marginLeft: 8 }}>
              Accept
            </button>
          )}
        </div>
      ))}
    </div>
  )
}