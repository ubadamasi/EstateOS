import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getPrismaForEstate } from "@/lib/prisma";
import { sendPaymentConfirmationEmail } from "@/lib/email";

const ConfirmSchema = z.object({
  reviewNote: z.string().max(500).optional(),
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

  const body = await req.json().catch(() => ({}));
  const parsed = ConfirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: {
      levy: { select: { name: true, amountKobo: true } },
      resident: { select: { name: true, email: true } },
    },
  });

  if (!payment || payment.estateId !== estateId) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  if (payment.status === "PAID") {
    return NextResponse.json({ error: "Payment already confirmed" }, { status: 409 });
  }

  await db.payment.update({
    where: { id: paymentId },
    data: {
      status: "PAID",
      paidAt: new Date(),
      reviewedAt: new Date(),
      reviewNote: parsed.data.reviewNote,
    },
  });

  // Send confirmation email if resident has email
  if (payment.resident.email) {
    const estate = await db.estate.findUnique({ where: { id: estateId } });
    if (estate) {
      await sendPaymentConfirmationEmail({
        to: payment.resident.email,
        residentName: payment.resident.name,
        levyName: payment.levy.name,
        amountNaira: payment.levy.amountKobo / 100,
        estateName: estate.name,
      }).catch(() => {
        // Don't fail the confirm if email fails
      });
    }
  }

  return NextResponse.json({ success: true });
}
