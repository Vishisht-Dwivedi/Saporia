import { prisma } from '@/lib/prisma'


export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get('customerId')
    const restaurantId = searchParams.get('restaurantId')

    let where: any = {}
    if (customerId) where.customerId = customerId
    if (restaurantId) where.restaurantId = restaurantId

    const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            restaurant: true,
            customer: true,
            deliveryAgent: true
        }
    })
    return Response.json(orders)
}

export async function POST(req: Request) {
    const body = await req.json()
    const {
        customerId,
        restaurantId,
        totalPrice,
        customerLat,
        customerLng
    } = body;
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId }
    });
    if (!restaurant) {
      return Response.json({ error: "Restaurant not found" }, { status: 404 })
    }
    const dx = restaurant.lat - customerLat;
    const dy = restaurant.lng - customerLng;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const deliveryFee = 20 + (8 * distance);
    const order = await prisma.order.create({
        data: {
            customerId,
            restaurantId,
            status: "PENDING_RESTAURANT",
            totalPrice,
            deliveryFee,
            customerLat,
            customerLng
        }
    });
    return Response.json(order);
}