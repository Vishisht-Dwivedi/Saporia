"use client"

import { useEffect, useState } from "react"

const cardStyle = {
  background: '#fff',
  borderRadius: 8,
  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  padding: 16,
  marginBottom: 16,
  maxWidth: 400
}
const buttonStyle = {
  background: '#2d8f4e',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  padding: '8px 16px',
  cursor: 'pointer',
  marginTop: 8
}
const sectionTitle = {
  fontWeight: 600,
  fontSize: 20,
  margin: '24px 0 12px 0'
}
const orderStyle = {
  background: '#f6f6f6',
  borderRadius: 6,
  padding: 10,
  marginBottom: 8,
  fontSize: 15
}

export default function CustomerPage() {
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [menu, setMenu] = useState<any[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const u = localStorage.getItem("user")
    if (u) setUser(JSON.parse(u))
  }, [])

  useEffect(() => {
    fetch("/api/restaurants")
      .then(res => res.json())
      .then(setRestaurants)
  }, [])

  const loadOrders = async () => {
    if (!user?.id) return
    const res = await fetch(`/api/orders?customerId=${user.id}`)
    const data = await res.json()
    setOrders(data)
  }

  useEffect(() => {
    if (user?.id) loadOrders()
  }, [user])

  const loadMenu = async (restaurant: any) => {
    setSelectedRestaurant(restaurant)
    const res = await fetch(`/api/restaurants/${restaurant.id}/menu`)
    const data = await res.json()
    setMenu(data)
  }

  const placeOrder = async () => {
    if (!user?.id || !selectedRestaurant) return
    const totalPrice = menu.reduce((sum, item) => sum + item.price, 0)
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: user.id,
        restaurantId: selectedRestaurant.id,
        totalPrice,
        customerLat: user.lat,
        customerLng: user.lng
      })
    })
    loadOrders()
  }

  return (
    <div style={{ background: '#f3f4f6', minHeight: '100vh', padding: 0 }}>
      <div style={{ background: '#2d8f4e', color: '#fff', padding: 20, fontSize: 28, fontWeight: 700, letterSpacing: 1, marginBottom: 24 }}>Saporia - Customer</div>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
        <div style={sectionTitle}>Restaurants</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {restaurants.map(r => (
            <div key={r.id} style={cardStyle}>
              <div style={{ fontWeight: 600, fontSize: 18 }}>{r.name}</div>
              <button style={buttonStyle} onClick={() => loadMenu(r)}>View Menu</button>
            </div>
          ))}
        </div>

        {selectedRestaurant && (
          <div style={{ marginTop: 32 }}>
            <div style={sectionTitle}>Menu ({selectedRestaurant.name})</div>
            <div style={{ ...cardStyle, maxWidth: 500 }}>
              {menu.length === 0 && <div>No items available.</div>}
              {menu.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>{item.name}</span>
                  <span style={{ fontWeight: 500 }}>₹{item.price}</span>
                </div>
              ))}
              {menu.length > 0 && (
                <button style={{ ...buttonStyle, width: '100%' }} onClick={placeOrder}>Place Order</button>
              )}
            </div>
          </div>
        )}

        <div style={sectionTitle}>Your Orders</div>
        <div>
          {orders.length === 0 && <div style={{ color: '#888' }}>No orders yet.</div>}
          {orders.map(o => (
            <div key={o.id} style={orderStyle}>
              <div><b>Order:</b> {o.id}</div>
              <div><b>Status:</b> {o.status}</div>
              <div><b>Restaurant:</b> {o.restaurant?.name || o.restaurantId}</div>
              <div><b>Total:</b> ₹{o.totalPrice}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}