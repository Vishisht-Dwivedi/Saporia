import { prisma } from '@/lib/prisma'
import eventBus from '@/lib/eventBus'

export async function POST(req: Request) {
  const { orderId, deliveryAgentId } = await req.json()
  console.log('[POST /api/orders/assign] Assigning order', orderId, 'to', deliveryAgentId)

  // Ensure agent is not currently carrying an OUT_FOR_DELIVERY package
  const orderToAssign = await prisma.order.findUnique({ where: { id: orderId } })
  if (!orderToAssign) {
    console.log('[POST /api/orders/assign] Order not found', orderId)
    return Response.json({ error: 'Order not found' }, { status: 404 })
  }
  const active = await prisma.order.findMany({ where: { deliveryAgentId, status: 'OUT_FOR_DELIVERY' } })
  const activeRestaurantIds = Array.from(new Set(active.map(a => a.restaurantId)))
  if (activeRestaurantIds.length > 0 && !(activeRestaurantIds.length === 1 && activeRestaurantIds[0] === orderToAssign.restaurantId)) {
    console.log('[POST /api/orders/assign] Agent', deliveryAgentId, 'is already delivering for other restaurant(s)', activeRestaurantIds)
    return Response.json({ error: 'Agent is already delivering for another restaurant' }, { status: 409 })
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      deliveryAgentId,
      status: "OUT_FOR_DELIVERY"
    }
  })
  console.log('[POST /api/orders/assign] Order updated:', order)

  // Emit event for customer notification (mimic queue)
  eventBus.emit('order:assigned', {
    orderId: order.id,
    customerId: order.customerId,
    message: `Your order is out for delivery!`
  });
  console.log('[POST /api/orders/assign] Emitted order:assigned for', order.id)

  return Response.json(order)
}