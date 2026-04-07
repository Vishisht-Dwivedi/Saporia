"use client"

import { useEffect, useState, useRef } from "react"
import { toast } from "react-hot-toast"
import Card from "@/components/Card"
import Button from "@/components/Button"
import Navbar from "@/components/Navbar"

export default function CustomerPage() {
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [menu, setMenu] = useState<any[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const [feedbackOrder, setFeedbackOrder] = useState<any>(null)
  const [feedback, setFeedback] = useState({ rating: 5, comment: "" })

  // WebSocket for live order status
  useEffect(() => {
    if (!user?.id) return
    const url = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/api/orders/ws?userId=${user.id}&role=${user.role}`
    let ws: WebSocket | null = null
    let opened = false
    try {
      ws = new WebSocket(url)
      const openTimer = setTimeout(() => {
        if (!opened) {
          console.warn('[customer] WS not opened, falling back to polling')
          loadOrders()
          const iv = setInterval(loadOrders, 3000)
          // store interval in ref via wsRef to clear on cleanup
          // @ts-ignore
          wsRef.current = { iv }
        }
      }, 2000)

      ws.onopen = () => { opened = true; clearTimeout(openTimer); }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === "order:assigned") {
          toast.success("Your order is out for delivery!")
          loadOrders()
        }
        if (data.type === "order:delivered") {
          toast.success("Order delivered! Please provide feedback.")
          setFeedbackOrder(data.orderId)
          loadOrders()
        }
      }
      wsRef.current = ws
    } catch (err) {
      console.warn('[customer] WS creation failed, starting polling', err)
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

  // Submit feedback
  const submitFeedback = async () => {
    if (!feedbackOrder) return
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: feedbackOrder,
        rating: feedback.rating,
        comment: feedback.comment
      })
    })
    setFeedbackOrder(null)
    setFeedback({ rating: 5, comment: "" })
    toast.success("Thank you for your feedback!")
  }

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
    console.log("Placing order with details: ", {
      customerId: user.id,
      restaurantId: selectedRestaurant.id,
      totalPrice,
      customerLat: user.lat,
      customerLng: user.lng
    });
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: user.id,
        restaurantId: selectedRestaurant.id,
        totalPrice,
        customerLat: user.lat,
        customerLng: user.lng
      })
    });
    console.log(res);
    loadOrders()
  }

  return (
    <div className="bg-[#fff8f6] min-h-screen font-sans">
      <Navbar user={user} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-extrabold mb-4 text-[#e23744] tracking-tight">Restaurants</h2>
        <div className="flex flex-wrap gap-6">
          {restaurants.map(r => (
            <Card key={r.id} className="w-72 border-[#e23744] border-opacity-20 hover:shadow-lg transition-shadow">
              <div className="font-semibold text-lg mb-2 text-[#e23744]">{r.name}</div>
              <Button onClick={() => loadMenu(r)} className="w-full mt-2 bg-[#e23744] hover:bg-[#b71c2b]">View Menu</Button>
            </Card>
          ))}
        </div>

        {selectedRestaurant && (
          <section className="mt-10">
            <h3 className="text-2xl font-semibold mb-3 text-[#e23744]">Menu ({selectedRestaurant.name})</h3>
            <Card className="max-w-xl border-[#e23744] border-opacity-20">
              {menu.length === 0 && <div className="text-gray-500">No items available.</div>}
              {menu.map(item => (
                <div key={item.id} className="flex justify-between mb-2">
                  <span>{item.name}</span>
                  <span className="font-medium text-[#e23744]">₹{item.price}</span>
                </div>
              ))}
              {menu.length > 0 && (
                <Button onClick={placeOrder} className="w-full mt-4 bg-[#e23744] hover:bg-[#b71c2b]">Place Order</Button>
              )}
            </Card>
          </section>
        )}

        <h2 className="text-3xl font-extrabold mt-10 mb-4 text-[#e23744] tracking-tight">Your Orders</h2>
        <div>
          {orders.length === 0 && <div className="text-gray-400">No orders yet.</div>}
          {orders.map(o => (
            <Card key={o.id} className="bg-[#fff0ee] border-[#e23744] border-opacity-10">
              <div className="mb-1"><b>Order:</b> {o.id}</div>
              <div className="mb-1"><b>Status:</b> <span className="text-[#e23744] font-semibold">{o.status.replace(/_/g, ' ')}</span></div>
              <div className="mb-1"><b>Restaurant:</b> {o.restaurant?.name || o.restaurantId}</div>
              <div className="mb-1"><b>Total:</b> <span className="text-[#e23744] font-semibold">₹{o.totalPrice}</span></div>
            </Card>
          ))}
        </div>

        {/* Feedback Modal */}
        {feedbackOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-lg max-w-md w-full">
              <h3 className="text-xl font-bold mb-4 text-[#e23744]">Rate Your Order</h3>
              <div className="flex items-center mb-4">
                {[1,2,3,4,5].map(star => (
                  <button
                    key={star}
                    className={`text-2xl mr-1 ${feedback.rating >= star ? 'text-[#e23744]' : 'text-gray-300'}`}
                    onClick={() => setFeedback(f => ({ ...f, rating: star }))}
                  >★</button>
                ))}
              </div>
              <textarea
                className="w-full border rounded p-2 mb-4"
                rows={3}
                placeholder="Leave a comment (optional)"
                value={feedback.comment}
                onChange={e => setFeedback(f => ({ ...f, comment: e.target.value }))}
              />
              <div className="flex justify-end gap-2">
                <Button onClick={() => setFeedbackOrder(null)} variant="secondary">Cancel</Button>
                <Button onClick={submitFeedback} className="bg-[#e23744] hover:bg-[#b71c2b]">Submit</Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}