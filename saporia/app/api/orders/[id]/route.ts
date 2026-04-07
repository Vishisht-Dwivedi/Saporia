import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  console.log('[GET /api/orders/:id] Fetching order', id)
  const order = await prisma.order.findUnique({
    where: { id }
  })
  console.log('[GET /api/orders/:id] Found order', order)

  return Response.json(order)
}

// Mark order as delivered and emit event for feedback
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  console.log('[PATCH /api/orders/:id] Marking delivered', id)
  const order = await prisma.order.update({
    where: { id },
    data: { status: "DELIVERED" }
  })
  console.log('[PATCH /api/orders/:id] Order updated to DELIVERED', order)
  // Emit event for feedback prompt
  const eventBus = (await import('@/lib/eventBus')).default
  eventBus.emit('order:delivered', {
    orderId: order.id,
    customerId: order.customerId,
    message: 'Order delivered! Please provide feedback.'
  })
  console.log('[PATCH /api/orders/:id] Emitted order:delivered for', order.id)
  return Response.json(order)
}