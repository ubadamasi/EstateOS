import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getPrismaForEstate } from "@/lib/prisma";
import { nairaToKobo } from "@/lib/format";

const CreateLevySchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  amountNaira: z.string().min(1),
  dueDate: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user.estateId || session.user.role !== "ESTATE_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CreateLevySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  let amountKobo: number;
  try {
    amountKobo = nairaToKobo(parsed.data.amountNaira);
  } catch {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  if (amountKobo <= 0) {
    return NextResponse.json(
      { error: "Amount must be greater than zero" },
      { status: 400 }
    );
  }

  const dueDate = new Date(parsed.data.dueDate);
  if (isNaN(dueDate.getTime())) {
    return NextResponse.json({ error: "Invalid due date" }, { status: 400 });
  }

  const estateId = session.user.estateId;
  const db = getPrismaForEstate(estateId);

  const levy = await db.levy.create({
    data: {
      estateId,
      name: parsed.data.name,
      description: parsed.data.description,
      amountKobo,
      dueDate,
      status: "DRAFT",
    },
  });

  return NextResponse.json({ levy }, { status: 201 });
}
