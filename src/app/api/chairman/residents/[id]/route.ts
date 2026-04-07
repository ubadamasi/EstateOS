import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getPrismaForEstate } from "@/lib/prisma";

const Schema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().min(7).max(20).optional(),
  email: z.string().email().optional().or(z.literal("")),
  type: z.enum(["LANDLORD", "TENANT"]).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user.estateId || session.user.role !== "ESTATE_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const estateId = session.user.estateId;
  const db = getPrismaForEstate(estateId);

  // Ensure resident belongs to this estate
  const existing = await db.resident.findUnique({ where: { id } });
  if (!existing || existing.estateId !== estateId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { email, ...rest } = parsed.data;
  const resident = await db.resident.update({
    where: { id },
    data: {
      ...rest,
      ...(email !== undefined ? { email: email === "" ? null : email } : {}),
    },
  });

  return NextResponse.json({ resident });
}
