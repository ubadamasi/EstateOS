import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getPrismaForEstate } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(
  _req: NextRequest,
  { params }: Params
) {
  const session = await getServerSession(authOptions);
  if (!session?.user.estateId || session.user.role !== "ESTATE_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: residentId } = await params;
  const estateId = session.user.estateId;
  const db = getPrismaForEstate(estateId);

  const [levies, payments] = await Promise.all([
    db.levy.findMany({
      where: { estateId, status: "ACTIVE" },
      select: { id: true, name: true, amountKobo: true, dueDate: true },
      orderBy: { dueDate: "asc" },
    }),
    db.payment.findMany({
      where: { estateId, residentId },
      select: { levyId: true },
    }),
  ]);

  const assignedIds = new Set(payments.map((p) => p.levyId));

  return NextResponse.json({
    levies: levies.map((l) => ({ ...l, assigned: assignedIds.has(l.id) })),
  });
}

const AssignSchema = z.object({
  levyIds: z.array(z.string().cuid()).min(1),
});

export async function POST(
  req: NextRequest,
  { params }: Params
) {
  const session = await getServerSession(authOptions);
  if (!session?.user.estateId || session.user.role !== "ESTATE_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: residentId } = await params;
  const estateId = session.user.estateId;
  const db = getPrismaForEstate(estateId);

  const body = await req.json().catch(() => ({}));
  const parsed = AssignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid levy IDs" }, { status: 400 });
  }

  // Verify resident belongs to this estate
  const resident = await db.resident.findUnique({
    where: { id: residentId },
    select: { id: true, estateId: true },
  });
  if (!resident || resident.estateId !== estateId) {
    return NextResponse.json({ error: "Resident not found" }, { status: 404 });
  }

  // Verify all levies belong to this estate and are ACTIVE
  const levies = await db.levy.findMany({
    where: { id: { in: parsed.data.levyIds }, estateId, status: "ACTIVE" },
    select: { id: true, amountKobo: true },
  });

  if (levies.length === 0) {
    return NextResponse.json({ error: "No valid active levies found" }, { status: 404 });
  }

  await db.payment.createMany({
    data: levies.map((l) => ({
      estateId,
      levyId: l.id,
      residentId,
      amountKobo: l.amountKobo,
      status: "UNPAID" as const,
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({ assigned: levies.length });
}
