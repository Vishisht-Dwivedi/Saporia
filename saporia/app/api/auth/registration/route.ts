import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(req: Request) {
    const body = await req.json()
    const { name, password, role, lat, lng } = body;
    if (!name || !password || !role) {
        return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    // check if user exists
    const existing = await prisma.user.findFirst({
      where: { name, role }
    })

    if (existing) {
      return Response.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: {
            name,
            password: hashedPassword,
            role,
            lat,
            lng
        }
    })
    // If registering a restaurant, ensure a Restaurant record exists
    if (role === 'RESTAURANT') {
      if (typeof lat === 'number' && typeof lng === 'number') {
        const restaurant = await prisma.restaurant.create({
          data: {
            name,
            userId: user.id,
            lat,
            lng
          }
        })
        console.log('[POST /api/auth/registration] Created restaurant for user', user.id, restaurant.id)
      } else {
        console.warn('[POST /api/auth/registration] Restaurant registration without lat/lng, skipping restaurant record creation')
      }
    }
    return Response.json(user)
}
