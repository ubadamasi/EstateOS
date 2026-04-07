import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "PLATFORM_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
      estateManager: {
        select: {
          estate: { select: { id: true, name: true } },
        },
      },
      residents: {
        select: {
          estate: { select: { name: true } },
          unitId: true,
        },
        take: 1,
      },
    },
  });

  return NextResponse.json({ users });
}
