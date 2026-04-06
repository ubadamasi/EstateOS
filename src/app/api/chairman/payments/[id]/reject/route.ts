import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getPrismaForEstate } from "@/lib/prisma";

const RejectSchema = z.object({
  reviewNote: z.string().min(1).max(500),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user.estateId || session.user.role !== "ESTATE_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: paymentId } = await params;
  const estateId = session.user.estateId;
  const db = getPrismaForEstate(estateId);

  const body = await req.json();
  const parsed = RejectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "A rejection reason is required" },
      { status: 400 }
    );
  }

  const payment = await db.payment.findUnique({ where: { id: paymentId } });

  if (!payment || payment.estateId !== estateId) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  if (payment.status !== "PENDING_REVIEW") {
    return NextResponse.json(
      { error: "Only PENDING_REVIEW payments can be rejected" },
      { status: 409 }
    );
  }

  await db.payment.update({
    where: { id: paymentId },
    data: {
      status: "UNPAID",
      reviewedAt: new Date(),
      reviewNote: parsed.data.reviewNote,
      receiptFileId: null,
      receiptUploadedAt: null,
    },
  });

  return NextResponse.json({ success: true });
}
