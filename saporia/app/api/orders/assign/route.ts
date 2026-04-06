import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { orderId, deliveryAgentId } = await req.json()

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      deliveryAgentId,
      status: "OUT_FOR_DELIVERY"
    }
  })

  return Response.json(order)
}