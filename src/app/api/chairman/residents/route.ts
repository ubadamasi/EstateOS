import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getPrismaForEstate } from "@/lib/prisma";

const Schema = z.object({
  name: z.string().min(1).max(100),
  unitId: z.string().min(1).max(20),
  phone: z.string().min(7).max(20),
  email: z.string().email().optional().or(z.literal("")),
  type: z.enum(["LANDLORD", "TENANT"]).default("TENANT"),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user.estateId || session.user.role !== "ESTATE_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { name, unitId, phone, email, type } = parsed.data;
  const estateId = session.user.estateId;
  const db = getPrismaForEstate(estateId);

  try {
    const resident = await db.resident.create({
      data: {
        estateId,
        name,
        unitId,
        phone,
        email: email || null,
        type,
      },
    });
    return NextResponse.json({ resident }, { status: 201 });
  } catch (e: unknown) {
    const msg = (e as { code?: string }).code === "P2002"
      ? "A resident with that unit ID or phone already exists"
      : "Failed to create resident";
    return NextResponse.json({ error: msg }, { status: 409 });
  }
}
