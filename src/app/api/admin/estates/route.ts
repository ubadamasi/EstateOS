import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CreateEstateSchema = z.object({
  name: z.string().min(2).max(120),
  address: z.string().min(2).max(200),
  city: z.string().min(1).max(80),
  state: z.string().min(1).max(80),
  unitCount: z.number().int().min(1),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PLATFORM_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CreateEstateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const estate = await prisma.estate.create({
    data: {
      name: parsed.data.name,
      address: parsed.data.address,
      city: parsed.data.city,
      state: parsed.data.state,
      unitCount: parsed.data.unitCount,
      status: "ACTIVE",
    },
  });

  return NextResponse.json({ estate }, { status: 201 });
}
