import { prisma } from '@/lib/prisma'
import eventBus from '@/lib/eventBus'


export async function GET(req: Request) {
    console.log("[GET /api/orders] Incoming request", req.url)
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get('customerId')
    const restaurantId = searchParams.get('restaurantId')
    const restaurantUserId = searchParams.get('restaurantUserId')
    const status = searchParams.get('status')

        let where: any = {}
        if (customerId) where.customerId = customerId
        if (restaurantId) where.restaurantId = restaurantId
        if (restaurantUserId) {
            // if caller passed a restaurant's userId, resolve to restaurant id
            const rest = await prisma.restaurant.findFirst({ where: { userId: restaurantUserId } })
            if (rest) where.restaurantId = rest.id
        }
        if (status) where.status = status

    const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            restaurant: true,
            customer: true,
            deliveryAgent: true
        }
    })
    console.log("[GET /api/orders] Returning orders:", orders)
    return Response.json(orders)
}

export async function POST(req: Request) {
    console.log("[POST /api/orders] Incoming request")
    const body = await req.json()
    console.log("[POST /api/orders] Body:", body)
    const {
        customerId,
        restaurantId,
        menuItemId,
        customerLat,
        customerLng
    } = body;
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId }
    });
    if (!restaurant) {
      console.log("[POST /api/orders] Restaurant not found", restaurantId)
      return Response.json({ error: "Restaurant not found" }, { status: 404 })
    }
    if (!menuItemId) {
      console.log("[POST /api/orders] menuItemId missing")
      return Response.json({ error: "menuItemId is required" }, { status: 400 })
    }
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId }
    })
    if (!menuItem) {
      console.log("[POST /api/orders] Menu item not found", menuItemId)
      return Response.json({ error: "Menu item not found" }, { status: 404 })
    }
    const dx = restaurant.lat - customerLat;
    const dy = restaurant.lng - customerLng;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const fixedValue = 8; // rate per unit distance
    const deliveryFee = parseFloat((distance * fixedValue).toFixed(2));
    const totalPrice = parseFloat((menuItem.price + deliveryFee).toFixed(2));
    const order = await prisma.order.create({
        data: {
            customerId,
            restaurantId,
            status: "PENDING_RESTAURANT",
            totalPrice,
            deliveryFee,
            customerLat,
            customerLng,
            menuItemId: menuItem.id,
            menuItemName: menuItem.name,
            menuItemPrice: menuItem.price
        }
    });
    console.log("[POST /api/orders] Created order:", order)
    // Emit event for restaurant notification (mimic queue)
        eventBus.emit('order:new', {
            orderId: order.id,
            restaurantId,
            // include the restaurant's user id so sockets keyed by userId receive it
            restaurantUserId: restaurant.userId,
            message: `New order received!`
        });
    return Response.json(order);
}