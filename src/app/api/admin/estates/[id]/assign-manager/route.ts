import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const AssignManagerSchema = z.object({
  email: z.string().email(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PLATFORM_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: estateId } = await params;

  const estate = await prisma.estate.findUnique({ where: { id: estateId } });
  if (!estate) {
    return NextResponse.json({ error: "Estate not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = AssignManagerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { email } = parsed.data;

  // Find or create user by email
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        role: "ESTATE_MANAGER",
      },
    });
  } else {
    // Ensure role is ESTATE_MANAGER
    if (user.role !== "ESTATE_MANAGER") {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "ESTATE_MANAGER" },
      });
    }
  }

  // Upsert EstateManager record
  const existing = await prisma.estateManager.findUnique({
    where: { userId: user.id },
  });

  if (existing) {
    await prisma.estateManager.update({
      where: { userId: user.id },
      data: { estateId },
    });
  } else {
    await prisma.estateManager.create({
      data: {
        userId: user.id,
        estateId,
      },
    });
  }

  return NextResponse.json({ success: true, userId: user.id });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PLATFORM_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: estateId } = await params;

  // Remove all managers from this estate
  await prisma.estateManager.deleteMany({ where: { estateId } });

  return NextResponse.json({ success: true });
}
