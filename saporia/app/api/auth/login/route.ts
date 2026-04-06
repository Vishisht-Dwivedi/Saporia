import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/jwt'
import bcrypt from 'bcrypt'

export async function POST(req: Request) {
    const body = await req.json()
    const { name, password, role } = body
    const user = await prisma.user.findFirst({
      where: { name, role }
    })
    if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 })
    }
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return Response.json({ error: "Invalid password" }, { status: 401 })
    }
    const token = signToken({ id: user.id, name: user.name, role: user.role })
    const response = Response.json({ user: { id: user.id, name: user.name, role: user.role } })
    response.headers.set('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`)
    return response
}
