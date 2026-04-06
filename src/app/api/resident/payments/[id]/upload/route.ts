import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getPrismaForEstate } from "@/lib/prisma";
import { storeFile, FileUploadError } from "@/lib/storage";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id || !session.user.estateId || session.user.role !== "RESIDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: paymentId } = await params;
  const estateId = session.user.estateId;
  const db = getPrismaForEstate(estateId);

  // Verify payment belongs to this resident's estate and is not already paid
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: { resident: { select: { userId: true } } },
  });

  if (!payment || payment.estateId !== estateId) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  if (payment.resident.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (payment.status === "PAID") {
    return NextResponse.json(
      { error: "Payment is already confirmed" },
      { status: 409 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("receipt");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const fileId = await storeFile({ file, uploadedById: session.user.id });

    await db.payment.update({
      where: { id: paymentId },
      data: {
        receiptFileId: fileId,
        receiptUploadedAt: new Date(),
        status: "PENDING_REVIEW",
      },
    });

    return NextResponse.json({ success: true, fileId });
  } catch (err) {
    if (err instanceof FileUploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
