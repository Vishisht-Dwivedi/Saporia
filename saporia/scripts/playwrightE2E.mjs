#!/usr/bin/env node
import { chromium } from 'playwright';

const base = process.env.BASE_URL || 'http://localhost:3000';
const wait = ms => new Promise(r => setTimeout(r, ms));

async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`${base}/api/restaurants`);
      if (r.ok) return;
    } catch (e) {}
    console.log('Waiting for server...');
    await wait(1500);
  }
  throw new Error('Server did not start in time');
}

async function loginPage(page, name, password, role) {
  await page.goto(`${base}/login`);
  await page.fill('input[placeholder="Name"]', name);
  await page.fill('input[placeholder="Password"]', password);
  await page.selectOption('select', role);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }),
    page.click('button:has-text("Login")')
  ]);
}

async function main() {
  console.log('Playwright E2E starting');
  await waitForServer();

  const browser = await chromium.launch();
  const contextCust = await browser.newContext();
  const contextRest = await browser.newContext();
  const contextAgent = await browser.newContext();

  const pageCust = await contextCust.newPage();
  const pageRest = await contextRest.newPage();
  const pageAgent = await contextAgent.newPage();

  // Login all users
  await loginPage(pageCust, 'customer1', '1234', 'CUSTOMER');
  await loginPage(pageRest, 'Pizza Place', '1234', 'RESTAURANT');
  await loginPage(pageAgent, 'agent1', '1234', 'DELIVERY');

  console.log('Logged in contexts');

  // Open restaurant and agent dashboards
  await pageRest.goto(`${base}/restaurant`);
  await pageAgent.goto(`${base}/delivery`);
  await pageCust.goto(`${base}/customer`);

  // Debug: dump localStorage user and restaurants list for restaurant page
  const dbg = await pageRest.evaluate(async () => {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    const res = await fetch('/api/restaurants');
    const restaurants = await res.json();
    return { user, restaurants };
  });
  console.log('DEBUG restaurant context:', dbg);

  // Customer: create an order via API (more reliable than UI click)
  const createdOrder = await pageCust.evaluate(async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const restaurantsRes = await fetch('/api/restaurants');
    const restaurants = await restaurantsRes.json();
    const restaurant = restaurants[0];
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: user.id,
        restaurantId: restaurant.id,
        totalPrice: 99,
        customerLat: user.lat || 23.25,
        customerLng: user.lng || 77.41
      })
    });
    return res.ok ? await res.json() : null;
  });
  if (!createdOrder) throw new Error('Customer failed to create order')
  console.log('Customer placed order', createdOrder.id);

  // Ensure the order exists on the server for this restaurant (poll)
  let orderId = null;
  for (let i = 0; i < 20; i++) {
    try {
      const list = await pageRest.evaluate(async () => {
        const u = (await fetch('/api/auth/verify')).ok ? true : true; // noop to keep evaluate async
        return []
      });
    } catch (e) {}
    const ordersRes = await pageRest.evaluate(async () => {
      const r = await fetch('/api/restaurants');
      const list = await r.json();
      return list;
    });
    // try to find the restaurant record for this user and then orders
    const rest = ordersRes.find(r => r.name === 'Pizza Place') || ordersRes[0];
    if (rest) {
      const oRes = await pageRest.evaluate(async (rid) => {
        const rr = await fetch(`/api/orders?restaurantId=${rid}`);
        return rr.ok ? await rr.json() : [];
      }, rest.id);
      if (oRes && oRes.length > 0) {
        orderId = oRes[0].id;
        break;
      }
    }
    await new Promise(r => setTimeout(r, 500));
  }
  if (!orderId) throw new Error('Order not found on server for restaurant');
  console.log('Order appears on server:', orderId);
  // Debug: snapshot restaurant page text to inspect what is rendered
  const snapshot = await pageRest.evaluate(() => document.body.innerText.slice(0, 5000));
  console.log('RESTAURANT PAGE SNAPSHOT:', snapshot);

  // Restaurant: wait for new order to appear in UI (allow longer timeout)
  await pageRest.waitForSelector('text=PENDING_RESTAURANT', { timeout: 30000 });
  console.log('Restaurant sees pending order');

  // Restaurant: accept the first pending order
  await pageRest.click('text=Accept');
  console.log('Restaurant accepted order');

  // Agent: wait for PENDING_DELIVERY orders and accept delivery
  await pageAgent.waitForSelector('text=Accept Delivery', { timeout: 10000 });
  await pageAgent.click('text=Accept Delivery');
  console.log('Agent accepted delivery');

  // Customer: wait for OUT_FOR_DELIVERY status
  await pageCust.waitForSelector('text=OUT_FOR_DELIVERY', { timeout: 10000 });
  console.log('Customer sees out for delivery');

  // Mark delivered via API from agent context
  const agentOrders = await pageAgent.evaluate(async () => {
    const res = await fetch('/api/orders?status=OUT_FOR_DELIVERY');
    return res.json();
  });
  if (!agentOrders || agentOrders.length === 0) throw new Error('No out-for-delivery orders to mark delivered');
  const delOrderId = agentOrders[0].id;
  await pageAgent.evaluate(async (id) => {
    await fetch(`/api/orders/${id}`, { method: 'PATCH' });
  }, delOrderId);
  console.log('Marked order delivered:', delOrderId);

  // Customer: wait for delivered state and feedback modal
  await pageCust.waitForSelector('text=Rate Your Order', { timeout: 10000 });
  console.log('Customer prompted for feedback');

  // Submit feedback
  await pageCust.click('button:has-text("Submit")');
  console.log('Feedback submitted');

  await browser.close();
  console.log('Playwright E2E passed');
}

main().catch(err => {
  console.error('Playwright E2E failed', err);
  process.exit(1);
});
