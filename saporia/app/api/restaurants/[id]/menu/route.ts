import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  console.log('[GET /api/restaurants/:id/menu] Fetching menu for', id)
  const data = await prisma.menuItem.findMany({
    where: { restaurantId: id }
  })
  console.log('[GET /api/restaurants/:id/menu] Found', data.length, 'items')
  return Response.json(data)
}