"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { toast } from "react-hot-toast"
import Card from "@/components/Card"
import Button from "@/components/Button"
import Navbar from "@/components/Navbar"
import Map from "@/components/Map"

export default function CustomerPage() {
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [menu, setMenu] = useState<any[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [cart, setCart] = useState<Array<any>>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
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

  const markReceived = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'PATCH' })
      if (!res.ok) {
        toast.error('Failed to mark received')
        return
      }
      toast.success('Marked as received')
      loadOrders()
    } catch (e) {
      console.error(e)
      toast.error('Network error')
    }
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

  const loadMenu = useCallback(async (restaurant: any) => {
    setSelectedRestaurant(restaurant)
    const res = await fetch(`/api/restaurants/${restaurant.id}/menu`)
    const data = await res.json()
    setMenu(data)
    setMenuOpen(true)
    toast.success(`Loaded menu for ${restaurant.name}`)
  }, [])

  const quickAdd = async (restaurant: any) => {
    try {
      const res = await fetch(`/api/restaurants/${restaurant.id}/menu`)
      const data = await res.json()
      if (!data || data.length === 0) return toast.error('No items to add')
      addToCart(data[0], restaurant)
    } catch (e) {
      console.error(e)
      toast.error('Could not load menu')
    }
  }
  // placeOrder can be used for immediate order or during checkout
  const placeOrder = async (item: any, restaurantParam?: any) => {
    const restaurant = restaurantParam || selectedRestaurant
    if (!user?.id || !restaurant || !item) return null
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: user.id,
          restaurantId: restaurant.id,
          menuItemId: item.id,
          customerLat: user.lat,
          customerLng: user.lng
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.status }))
        toast.error("Failed to place order: " + (err.error || err.message || res.status))
        return null
      }
      const order = await res.json()
      toast.success(`Ordered ${order.menuItemName} — ₹${order.menuItemPrice} (+ ₹${order.deliveryFee?.toFixed(2) || 0} delivery)`)
      loadOrders()
      return order
    } catch (e) {
      console.error(e)
      toast.error("Network error placing order")
      return null
    }
  }

  const addToCart = (item: any, restaurant: any) => {
    setCart(prev => {
      const idx = prev.findIndex(ci => ci.menuItemId === item.id)
      if (idx !== -1) {
        const copy = [...prev]
        copy[idx].qty += 1
        return copy
      }
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, restaurantId: restaurant.id, restaurantName: restaurant.name, qty: 1 }]
    })
    toast.success(`${item.name} added to cart`)
  }

  const removeFromCart = (menuItemId: string) => {
    setCart(prev => prev.filter(ci => ci.menuItemId !== menuItemId))
  }

  const changeQty = (menuItemId: string, delta: number) => {
    setCart(prev => prev.map(ci => ci.menuItemId === menuItemId ? { ...ci, qty: Math.max(1, ci.qty + delta) } : ci))
  }

  const checkout = async () => {
    if (!cart.length) return toast.error("Cart is empty")
    setIsCheckingOut(true)
    // Group cart items by restaurant
    const groups: Record<string, any> = {}
    cart.forEach(ci => {
      if (!groups[ci.restaurantId]) groups[ci.restaurantId] = { restaurantId: ci.restaurantId, restaurantName: ci.restaurantName, items: [] }
      groups[ci.restaurantId].items.push(ci)
    })
    try {
      for (const gid of Object.keys(groups)) {
        const group = groups[gid]
        // process items one by one for this restaurant
        for (const ci of group.items) {
          for (let i = 0; i < ci.qty; i++) {
            // find restaurant object in restaurants list to pass to placeOrder
            const rest = restaurants.find(r => r.id === ci.restaurantId)
            await placeOrder({ id: ci.menuItemId }, rest)
            // slight delay to avoid overwhelming (optional)
            await new Promise(res => setTimeout(res, 200))
          }
        }
      }
      toast.success('Checkout complete — orders created')
      setCart([])
      setCartOpen(false)
    } catch (e) {
      console.error(e)
      toast.error('Checkout failed')
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <div className="bg-[#fff8f6] min-h-screen font-sans">
      <Navbar user={user} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-extrabold mb-4 text-[#e23744] tracking-tight">Restaurants</h2>
        {/* Map showing restaurants and user */}
        <Map restaurants={restaurants} user={user} onRestaurantClick={loadMenu} />

        <div className="flex flex-wrap gap-6">
          {restaurants.map(r => (
            <Card key={r.id} className="w-72 border-[#e23744] border-opacity-20 hover:shadow-lg transition-shadow">
              <div className="font-semibold text-lg mb-2 text-[#e23744]">{r.name}</div>
              <div className="flex gap-2">
                <Button onClick={() => loadMenu(r)} className="flex-1 mt-2 bg-[#e23744] hover:bg-[#b71c2b]">View Menu</Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Floating Cart Button */}
        <div className="fixed right-6 top-24 z-40">
          <button onClick={() => setCartOpen(true)} className="bg-[#e23744] text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-3">
            Cart ({cart.reduce((s, c) => s + c.qty, 0)})
          </button>
        </div>

        {/* Menu modal (opened via View Menu) */}
        {menuOpen && selectedRestaurant && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-2xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-[#e23744]">Menu — {selectedRestaurant.name}</h3>
                <button onClick={() => setMenuOpen(false)} className="text-gray-500">Close</button>
              </div>
              <div className="space-y-3 max-h-[50vh] overflow-auto">
                {menu.length === 0 && <div className="text-gray-500">No items available.</div>}
                {menu.map(item => (
                  <div key={item.id} className="flex justify-between items-center border-b py-2">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">₹{item.price}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => addToCart(item, selectedRestaurant)} className="bg-[#f59e9e] hover:bg-[#f07b7b]">Add to cart</Button>
                      <Button onClick={() => { setSelectedItem(item); placeOrder(item) }} className="bg-[#e23744] hover:bg-[#b71c2b]">Order</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cart modal */}
        {cartOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-2xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-[#e23744]">Your Cart</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCartOpen(false)} className="text-gray-500">Close</button>
                </div>
              </div>
              <div className="space-y-3 max-h-[50vh] overflow-auto">
                {cart.length === 0 && <div className="text-gray-500">Cart is empty</div>}
                {cart.length > 0 && (
                  Object.values(cart.reduce((acc: any, ci: any) => {
                    if (!acc[ci.restaurantId]) acc[ci.restaurantId] = { restaurantName: ci.restaurantName, items: [] }
                    acc[ci.restaurantId].items.push(ci)
                    return acc
                  }, {})).map((grp: any) => (
                    <div key={grp.restaurantName} className="border p-3 rounded">
                      <div className="font-semibold mb-2">{grp.restaurantName}</div>
                      {grp.items.map((ci: any) => (
                        <div key={ci.menuItemId} className="flex justify-between items-center py-2">
                          <div>
                            <div className="font-medium">{ci.name}</div>
                            <div className="text-sm text-gray-500">₹{ci.price}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => changeQty(ci.menuItemId, -1)} className="px-2">-</button>
                            <div>{ci.qty}</div>
                            <button onClick={() => changeQty(ci.menuItemId, 1)} className="px-2">+</button>
                            <button onClick={() => removeFromCart(ci.menuItemId)} className="text-red-500 ml-2">Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )))
                }
              </div>
              <div className="mt-4 flex justify-end items-center gap-3">
                <div className="mr-auto font-medium">Total: ₹{cart.reduce((s, c) => s + c.price * c.qty, 0).toFixed(2)}</div>
                <Button variant="secondary" onClick={() => { setCart([]); setCartOpen(false) }}>Clear</Button>
                <Button onClick={checkout} className="bg-[#e23744] hover:bg-[#b71c2b]" disabled={isCheckingOut}>{isCheckingOut ? 'Processing...' : 'Checkout'}</Button>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-3xl font-extrabold mt-10 mb-4 text-[#e23744] tracking-tight">Your Orders</h2>
        <div>
          {orders.length === 0 && <div className="text-gray-400">No orders yet.</div>}
          {orders.map(o => (
            <Card key={o.id} className="bg-[#fff0ee] border-[#e23744] border-opacity-10">
              <div className="mb-1"><b>Order:</b> {o.id}</div>
              <div className="mb-1"><b>Status:</b> <span className="text-[#e23744] font-semibold">{o.status.replace(/_/g, ' ')}</span></div>
              <div className="mb-1"><b>Restaurant:</b> {o.restaurant?.name || o.restaurantId}</div>
              <div className="mb-1"><b>Item:</b> {o.menuItemName || '—'} {o.menuItemPrice != null && (<span className="text-[#e23744] font-semibold">₹{o.menuItemPrice}</span>)}</div>
              <div className="mb-1"><b>Delivery Fee:</b> <span className="text-[#e23744] font-semibold">₹{o.deliveryFee?.toFixed(2) || '0.00'}</span></div>
              <div className="mb-1"><b>Total:</b> <span className="text-[#e23744] font-semibold">₹{o.totalPrice}</span></div>
              {o.status === 'OUT_FOR_DELIVERY' && (
                <div className="mt-2">
                  <Button onClick={() => markReceived(o.id)} className="bg-green-600 hover:bg-green-700">Confirm Received</Button>
                </div>
              )}
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