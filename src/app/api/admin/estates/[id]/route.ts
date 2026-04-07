import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const UpdateEstateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  address: z.string().min(2).max(200).optional(),
  city: z.string().min(1).max(80).optional(),
  state: z.string().min(1).max(80).optional(),
  unitCount: z.number().int().min(1).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "PENDING"]).optional(),
});

export async function PATCH(
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

  const body = await req.json().catch(() => ({}));
  const parsed = UpdateEstateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const updated = await prisma.estate.update({
    where: { id: estateId },
    data: parsed.data as Parameters<typeof prisma.estate.update>[0]["data"],
  });

  return NextResponse.json({ estate: updated });
}
