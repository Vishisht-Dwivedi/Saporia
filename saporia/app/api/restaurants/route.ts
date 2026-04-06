import { prisma } from "@/lib/prisma";
export async function GET() {
  const data = await prisma.restaurant.findMany()
  return Response.json(data)
}