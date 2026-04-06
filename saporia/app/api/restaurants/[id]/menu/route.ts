import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  const data = await prisma.menuItem.findMany({
    where: { restaurantId: id }
  })

  return Response.json(data)
}