#!/usr/bin/env node
// Smoke test for backend API integration with frontend flows.
// Usage: node scripts/smokeTest.mjs

const base = process.env.BASE_URL || 'http://localhost:3000'
const wait = ms => new Promise(res => setTimeout(res, ms))

function extractToken(setCookie) {
  if (!setCookie) return null
  const m = setCookie.match(/token=([^;]+)/)
  return m ? m[1] : null
}

async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`${base}/api/restaurants`)
      if (r.ok) return
    } catch (e) {}
    console.log('Waiting for server to respond...')
    await wait(1500)
  }
  throw new Error('Server did not start in time')
}

async function login(name, password, role) {
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password, role })
  })
  const json = await res.json().catch(() => null)
  const sc = res.headers.get('set-cookie') || res.headers.get('Set-Cookie')
  const token = extractToken(sc)
  return { status: res.status, json, token }
}

async function main() {
  console.log('Starting smoke tests...')
  await waitForServer()
  console.log('Server is up — running endpoint checks')

  // 1) List restaurants
  const r = await fetch(`${base}/api/restaurants`)
  if (!r.ok) throw new Error('/api/restaurants failed: ' + r.status)
  const restaurants = await r.json()
  console.log('Found restaurants:', restaurants.map(x => ({ id: x.id, name: x.name })))
  if (!restaurants || restaurants.length === 0) throw new Error('No restaurants seeded')
  const restaurant = restaurants[0]

  // 2) Customer login
  const cust = await login('customer1', '1234', 'CUSTOMER')
  console.log('Customer login status:', cust.status, 'user:', cust.json?.user?.id)
  if (cust.status !== 200) throw new Error('Customer login failed')
  const customerId = cust.json.user.id

  // 3) Place order
  const place = await fetch(`${base}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(cust.token ? { cookie: `token=${cust.token}` } : {}) },
    body: JSON.stringify({
      customerId,
      restaurantId: restaurant.id,
      totalPrice: 100,
      customerLat: 23.25,
      customerLng: 77.41
    })
  })
  const order = await place.json()
  console.log('Placed order:', order.id, 'status:', order.status)
  if (!order.id) throw new Error('Order creation failed')

  // 4) Verify customer orders
  const ordersList = await fetch(`${base}/api/orders?customerId=${customerId}`)
  const ordersJson = await ordersList.json()
  console.log('Orders for customer:', ordersJson.map(o => ({ id: o.id, status: o.status })))

  // 5) Restaurant login and accept
  const restLogin = await login(restaurant.name, '1234', 'RESTAURANT')
  console.log('Restaurant login status:', restLogin.status)
  if (restLogin.status !== 200) throw new Error('Restaurant login failed')

  const acceptRes = await fetch(`${base}/api/orders/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(restLogin.token ? { cookie: `token=${restLogin.token}` } : {}) },
    body: JSON.stringify({ orderId: order.id })
  })
  const accepted = await acceptRes.json()
  console.log('Order accepted:', accepted.id, accepted.status)

  // 6) Delivery agent login and assign
  const agentLogin = await login('agent1', '1234', 'DELIVERY')
  console.log('Agent login status:', agentLogin.status, 'id:', agentLogin.json?.user?.id)
  if (agentLogin.status !== 200) throw new Error('Agent login failed')
  const deliveryAgentId = agentLogin.json.user.id

  const assignRes = await fetch(`${base}/api/orders/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: order.id, deliveryAgentId })
  })
  const assigned = await assignRes.json()
  console.log('Order assigned:', assigned.id, assigned.status)

  // 7) Mark delivered
  const deliveredRes = await fetch(`${base}/api/orders/${order.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  })
  const delivered = await deliveredRes.json()
  console.log('Order delivered:', delivered.id, delivered.status)

  // 8) Feedback
  const fbRes = await fetch(`${base}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: order.id, rating: 5, comment: 'Great!' })
  })
  const fb = await fbRes.json()
  console.log('Feedback:', fb.id)

  console.log('All smoke tests passed')
}

main().catch(err => {
  console.error('Smoke test failed:', err)
  process.exit(1)
})
