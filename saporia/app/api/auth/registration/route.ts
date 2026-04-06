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
    return Response.json(user)
}
