import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { orderId, rating, comment } = await req.json();
  console.log('[POST /api/feedback] Received feedback for order', orderId)
  if (!orderId || !rating) {
    console.warn('[POST /api/feedback] Missing orderId or rating')
    return Response.json({ error: "Missing orderId or rating" }, { status: 400 });
  }
  const feedback = await prisma.feedback.create({
    data: {
      orderId,
      rating,
      comment,
    },
  });
  console.log('[POST /api/feedback] Created feedback', feedback.id)
  return Response.json(feedback);
}
