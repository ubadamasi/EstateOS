import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getPrismaForEstate } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user.estateId || session.user.role !== "ESTATE_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: levyId } = await params;
  const estateId = session.user.estateId;
  const db = getPrismaForEstate(estateId);

  const levy = await db.levy.findUnique({
    where: { id: levyId },
  });

  if (!levy || levy.estateId !== estateId) {
    return NextResponse.json({ error: "Levy not found" }, { status: 404 });
  }

  if (levy.status !== "DRAFT") {
    return NextResponse.json(
      { error: "Only DRAFT levies can be activated" },
      { status: 409 }
    );
  }

  const residents = await db.resident.findMany({
    where: { estateId, isActive: true },
    select: { id: true },
  });

  if (residents.length === 0) {
    return NextResponse.json(
      { error: "No active residents to create payments for" },
      { status: 409 }
    );
  }

  // Activate levy and create payment rows for all active residents in one transaction
  await db.$transaction([
    db.levy.update({
      where: { id: levyId },
      data: { status: "ACTIVE" },
    }),
    db.payment.createMany({
      data: residents.map((r) => ({
        estateId,
        levyId,
        residentId: r.id,
        amountKobo: levy.amountKobo,
        status: "UNPAID" as const,
      })),
      skipDuplicates: true,
    }),
  ]);

  return NextResponse.json({ success: true, paymentCount: residents.length });
}
