#!/usr/bin/env node
import WebSocket from 'ws'

const base = process.env.BASE_URL || 'http://localhost:3000'
const wsHost = 'ws://127.0.0.1:3000'

async function login(name, password, role) {
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password, role })
  })
  const json = await res.json()
  return json.user
}

async function main(){
  console.log('wsConnectTest starting')
  const restaurantsRes = await fetch(`${base}/api/restaurants`)
  const restaurants = await restaurantsRes.json()
  if (!restaurants || restaurants.length === 0) throw new Error('No restaurants')
  const restaurant = restaurants[0]
  const restUser = await login(restaurant.name, '1234', 'RESTAURANT')
  console.log('Logged in as', restUser.id)

  const url = `${wsHost}/api/orders/ws?userId=${restUser.id}&role=RESTAURANT`
  console.log('Connecting to', url)
  const ws = new WebSocket(url, { perMessageDeflate: false, headers: { Origin: base } })

  ws.on('open', () => {
    console.log('WS open')
    // keep alive
    setTimeout(() => { console.log('closing'); ws.close(); }, 5000)
  })
  ws.on('message', (m) => console.log('WS message:', m.toString()))
  ws.on('close', (code, reason) => { console.log('WS close', code, reason?.toString()); process.exit(0) })
  ws.on('error', (err) => { console.error('WS error', err); process.exit(1) })
}

main().catch(err => { console.error('wsConnectTest failed', err); process.exit(1) })
