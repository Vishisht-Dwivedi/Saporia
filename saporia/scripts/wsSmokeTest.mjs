#!/usr/bin/env node
import WebSocket from 'ws'

const base = process.env.BASE_URL || 'http://localhost:3000'
const wsProto = (base.startsWith('https') ? 'wss' : 'ws')

const wait = ms => new Promise(res => setTimeout(res, ms))

async function login(name, password, role) {
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password, role })
  })
  const json = await res.json()
  return json.user
}

function waitForMessage(ws, filter, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const onMessage = (msg) => {
      try {
        const data = JSON.parse(msg.toString())
        if (filter(data)) {
          ws.off('message', onMessage)
          resolve(data)
        }
      } catch (e) {}
    }
    ws.on('message', onMessage)
    setTimeout(() => {
      ws.off('message', onMessage)
      reject(new Error('Timeout waiting for message'))
    }, timeout)
  })
}

async function main(){
  console.log('WS smoke test starting')
  const restaurantsRes = await fetch(`${base}/api/restaurants`)
  const restaurants = await restaurantsRes.json()
  if (!restaurants || restaurants.length === 0) throw new Error('No restaurants')
  const restaurant = restaurants[0]

  const customer = await login('customer1', '1234', 'CUSTOMER')
  const restUser = await login(restaurant.name, '1234', 'RESTAURANT')
  const agent = await login('agent1', '1234', 'DELIVERY')

  console.log('Logged in:', { customer: customer.id, restaurantUser: restUser.id, agent: agent.id })

  const targetHost = `${new URL(base).host}`
  const restWs = new WebSocket(`${wsProto}://${targetHost}/api/orders/ws?userId=${restUser.id}&role=RESTAURANT`, { headers: { Origin: base } })
  const custWs = new WebSocket(`${wsProto}://${targetHost}/api/orders/ws?userId=${customer.id}&role=CUSTOMER`, { headers: { Origin: base } })
  const agentWs = new WebSocket(`${wsProto}://${targetHost}/api/orders/ws?userId=${agent.id}&role=DELIVERY`, { headers: { Origin: base } })

  await new Promise(res => setTimeout(res, 500))

  // Place order
  const placeRes = await fetch(`${base}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: customer.id,
      restaurantId: restaurant.id,
      totalPrice: 99,
      customerLat: 23.25,
      customerLng: 77.41
    })
  })
  const order = await placeRes.json()
  console.log('Placed order', order.id)

  // restaurant should receive order:new
  const newMsg = await waitForMessage(restWs, d => d.type === 'order:new', 5000)
  console.log('Restaurant got message', newMsg.type)

  // accept order
  const acceptRes = await fetch(`${base}/api/orders/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: order.id })
  })
  const accepted = await acceptRes.json()
  console.log('Order accepted:', accepted.id)

  // delivery agents should get order:accepted
  const accMsg = await waitForMessage(agentWs, d => d.type === 'order:accepted', 5000)
  console.log('Agent got message', accMsg.type)

  // assign order to agent
  const assignRes = await fetch(`${base}/api/orders/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: order.id, deliveryAgentId: agent.id })
  })
  const assigned = await assignRes.json()
  console.log('Assigned:', assigned.id)

  // customer should get order:assigned
  const assignedMsg = await waitForMessage(custWs, d => d.type === 'order:assigned', 5000)
  console.log('Customer got message', assignedMsg.type)

  // mark delivered
  const deliveredRes = await fetch(`${base}/api/orders/${order.id}`, { method: 'PATCH' })
  const delivered = await deliveredRes.json()
  console.log('Delivered:', delivered.id)

  const deliveredMsg = await waitForMessage(custWs, d => d.type === 'order:delivered', 5000)
  console.log('Customer got delivered message', deliveredMsg.type)

  restWs.close()
  custWs.close()
  agentWs.close()

  console.log('WS smoke test passed')
}

main().catch(err => { console.error('WS smoke test failed', err); process.exit(1) })
