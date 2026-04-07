import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { getPrismaForEstate } from "@/lib/prisma";
import { prisma } from "@/lib/prisma";

const Schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user.estateId || session.user.role !== "ESTATE_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: residentId } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const db = getPrismaForEstate(session.user.estateId);

  // Get resident — must belong to this estate
  const resident = await db.resident.findUnique({
    where: { id: residentId },
    select: { id: true, estateId: true, email: true, name: true, userId: true },
  });

  if (!resident || resident.estateId !== session.user.estateId) {
    return NextResponse.json({ error: "Resident not found" }, { status: 404 });
  }

  if (!resident.email) {
    return NextResponse.json({ error: "Resident has no email — add an email first" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  // Find or create the User account and set the password
  const user = await prisma.user.upsert({
    where: { email: resident.email },
    update: { passwordHash, emailVerified: new Date() },
    create: {
      email: resident.email,
      name: resident.name,
      role: "RESIDENT",
      emailVerified: new Date(),
      passwordHash,
    },
  });

  // Link user to resident record if not already linked
  if (!resident.userId) {
    await db.resident.update({
      where: { id: residentId },
      data: { userId: user.id },
    });
  }

  return NextResponse.json({ success: true });
}
