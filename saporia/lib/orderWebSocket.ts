import eventBus from "@/lib/eventBus";
import fs from 'fs'

type ClientInfo = { ws: any; role?: string };
const clients: Record<string, ClientInfo> = {};

export function registerClient(userId: string, ws: any, role?: string) {
  clients[userId] = { ws, role };
  try { fs.appendFileSync('/tmp/saporia-ws.log', `register ${userId} role=${role} at ${new Date().toISOString()}\n`) } catch (e) {}
}

export function unregisterClient(userId: string) {
  delete clients[userId];
  try { fs.appendFileSync('/tmp/saporia-ws.log', `unregister ${userId} at ${new Date().toISOString()}\n`) } catch (e) {}
}

function setupEventListeners() {
  eventBus.on("order:new", ({ restaurantId, restaurantUserId, ...payload }) => {
    const targetId = restaurantUserId || restaurantId;
    const info = clients[targetId];
    if (info && info.ws && info.ws.readyState === 1) {
      try { info.ws.send(JSON.stringify({ type: "order:new", ...payload })) }
      catch (err) { console.error('[orderWebSocket] Failed sending order:new to', targetId, err) }
    }
    try { fs.appendFileSync('/tmp/saporia-ws.log', `emit order:new -> ${targetId} payload=${JSON.stringify(payload)}\n`) } catch (e) {}
  });

  eventBus.on("order:accepted", (payload) => {
    Object.entries(clients).forEach(([uid, info]) => {
      if (info.role === 'DELIVERY' && info.ws && info.ws.readyState === 1) {
        try { info.ws.send(JSON.stringify({ type: "order:accepted", ...payload })) }
        catch (err) { console.error('[orderWebSocket] Failed sending order:accepted to', uid, err) }
      }
    });
    try { fs.appendFileSync('/tmp/saporia-ws.log', `emit order:accepted payload=${JSON.stringify(payload)}\n`) } catch (e) {}
  });

  eventBus.on("order:assigned", ({ customerId, ...payload }) => {
    const info = clients[customerId];
    if (info && info.ws && info.ws.readyState === 1) {
      try { info.ws.send(JSON.stringify({ type: "order:assigned", ...payload })) }
      catch (err) { console.error('[orderWebSocket] Failed sending order:assigned to', customerId, err) }
    }
    try { fs.appendFileSync('/tmp/saporia-ws.log', `emit order:assigned -> ${customerId} payload=${JSON.stringify(payload)}\n`) } catch (e) {}
  });

  eventBus.on("order:delivered", ({ customerId, ...payload }) => {
    const info = clients[customerId];
    if (info && info.ws && info.ws.readyState === 1) {
      try { info.ws.send(JSON.stringify({ type: "order:delivered", ...payload })) }
      catch (err) { console.error('[orderWebSocket] Failed sending order:delivered to', customerId, err) }
    }
    try { fs.appendFileSync('/tmp/saporia-ws.log', `emit order:delivered -> ${customerId} payload=${JSON.stringify(payload)}\n`) } catch (e) {}
  });
}

setupEventListeners();
