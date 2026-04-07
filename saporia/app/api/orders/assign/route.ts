import { prisma } from '@/lib/prisma'
import eventBus from '@/lib/eventBus'

export async function POST(req: Request) {
  const { orderId, deliveryAgentId } = await req.json()
  console.log('[POST /api/orders/assign] Assigning order', orderId, 'to', deliveryAgentId)

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