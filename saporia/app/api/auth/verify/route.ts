import { verifyToken } from '@/lib/jwt'

export async function POST(req: Request) {
    const cookies = req.headers.get('cookie')
    const token = cookies?.split('; ').find(c => c.startsWith('token='))?.split('=')[1]
    
    if (!token) {
        return Response.json({ error: "Token required" }, { status: 400 })
    }
    const decoded = verifyToken(token)    
    if (!decoded) {
        return Response.json({ error: "Invalid token" }, { status: 401 })
    }
    return Response.json({ valid: true, user: decoded })
}
