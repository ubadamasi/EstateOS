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

  const levy = await db.levy.findUnique({ where: { id: levyId } });

  if (!levy || levy.estateId !== estateId) {
    return NextResponse.json({ error: "Levy not found" }, { status: 404 });
  }

  if (levy.status === "CLOSED") {
    return NextResponse.json({ error: "Levy already closed" }, { status: 409 });
  }

  await db.levy.update({
    where: { id: levyId },
    data: { status: "CLOSED" },
  });

  return NextResponse.json({ success: true });
}
