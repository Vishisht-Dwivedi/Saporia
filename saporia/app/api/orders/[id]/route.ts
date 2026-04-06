import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const order = await prisma.order.findUnique({
    where: { id: params.id }
  })

  return Response.json(order)
}