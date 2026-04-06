import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getPrismaForEstate } from "@/lib/prisma";
import { nairaToKobo } from "@/lib/format";

const CreateExpenseSchema = z.object({
  category: z.enum([
    "SECURITY",
    "MAINTENANCE",
    "UTILITIES",
    "ADMINISTRATION",
    "OTHER",
  ]),
  description: z.string().min(2).max(300),
  amountNaira: z.string().min(1),
  expenseDate: z.string().min(1),
  receiptFileId: z.string().optional(),
  correctionNote: z.string().max(500).optional(),
  confirmed: z.boolean().optional(), // double-confirm for >₦200k
});

const DOUBLE_CONFIRM_THRESHOLD_KOBO = 20_000_000;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user.estateId || session.user.role !== "ESTATE_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CreateExpenseSchema.safeParse(body);
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

  const expenseDate = new Date(parsed.data.expenseDate);
  if (isNaN(expenseDate.getTime())) {
    return NextResponse.json({ error: "Invalid expense date" }, { status: 400 });
  }

  // Require double-confirm for large amounts
  if (
    Math.abs(amountKobo) >= DOUBLE_CONFIRM_THRESHOLD_KOBO &&
    !parsed.data.confirmed
  ) {
    return NextResponse.json(
      {
        requiresConfirm: true,
        message: `Amount is ₦${(Math.abs(amountKobo) / 100).toLocaleString("en-NG")}. Please confirm this large expense.`,
      },
      { status: 422 }
    );
  }

  const estateId = session.user.estateId;
  const db = getPrismaForEstate(estateId);

  const expense = await db.expense.create({
    data: {
      estateId,
      category: parsed.data.category,
      description: parsed.data.description,
      amountKobo,
      expenseDate,
      receiptFileId: parsed.data.receiptFileId,
      correctionNote: parsed.data.correctionNote,
    },
  });

  return NextResponse.json({ expense }, { status: 201 });
}
