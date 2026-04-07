import { prisma } from "@/lib/prisma";
export async function GET() {
  console.log('[GET /api/restaurants] Listing restaurants')
  const data = await prisma.restaurant.findMany()
  console.log('[GET /api/restaurants] Found', data.length, 'restaurants')
  return Response.json(data)
}