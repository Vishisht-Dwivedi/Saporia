import { registerClient, unregisterClient } from "@/lib/orderWebSocket";

export async function GET(req: Request) {
  // This handler expects a websocket upgrade socket on `req` (runtime dependent).
  // Accessing socket is runtime-specific, so cast to any to avoid type errors.
  // @ts-ignore
  const { socket } = req as any;
  if (!socket) {
    console.warn('[GET /api/orders/ws] No socket present on request')
    return new Response("WebSocket required", { status: 400 });
  }
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const role = searchParams.get("role") || undefined;
  if (!userId) {
    console.warn('[GET /api/orders/ws] Missing userId query param')
    return new Response("Missing userId", { status: 400 });
  }
  console.log('[GET /api/orders/ws] Registering websocket for user', userId)
  registerClient(userId, socket, role);
  socket.on("close", () => {
    console.log('[GET /api/orders/ws] Websocket closed for user', userId)
    unregisterClient(userId)
  });
  return new Response(null, { status: 101 });
}
