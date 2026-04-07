import { prisma } from '@/lib/prisma'
import eventBus from '@/lib/eventBus'

export async function POST(req: Request) {
    const { orderId } = await req.json();
    console.log('[POST /api/orders/accept] Accepting order:', orderId)
    const order = await prisma.order.update({
        where: { id: orderId },
        data: {
            status: "PENDING_DELIVERY"
        }
    });
    console.log('[POST /api/orders/accept] Order updated:', order)
    // Emit event for delivery agent notification (mimic queue)
    eventBus.emit('order:accepted', {
      orderId: order.id,
      restaurantId: order.restaurantId,
      message: `Order accepted by restaurant, ready for delivery!`
    });
    console.log('[POST /api/orders/accept] Emitted order:accepted for', order.id)
    return Response.json(order);
}