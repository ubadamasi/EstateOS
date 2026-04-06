import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getPrismaForEstate } from "@/lib/prisma";

interface ResidentRow {
  name: string;
  unit_id: string;
  phone: string;
  email?: string;
  type?: string;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: { row: number; reason: string }[];
}

function parseCSV(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  return lines.map((line) => {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        cells.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    cells.push(current.trim());
    return cells;
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user.estateId || session.user.role !== "ESTATE_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.name.endsWith(".csv")) {
    return NextResponse.json(
      { error: "Only .csv files are accepted" },
      { status: 400 }
    );
  }

  const text = await file.text();
  const rows = parseCSV(text);

  if (rows.length < 2) {
    return NextResponse.json(
      { error: "CSV must have a header row and at least one data row" },
      { status: 400 }
    );
  }

  const header = rows[0].map((h) => h.toLowerCase().replace(/\s+/g, "_"));
  const nameIdx = header.indexOf("name");
  const unitIdx = header.indexOf("unit_id");
  const phoneIdx = header.indexOf("phone");
  const emailIdx = header.indexOf("email");
  const typeIdx = header.indexOf("type");

  if (nameIdx === -1 || unitIdx === -1 || phoneIdx === -1) {
    return NextResponse.json(
      { error: "CSV must have columns: name, unit_id, phone (email and type optional)" },
      { status: 400 }
    );
  }

  const estateId = session.user.estateId;
  const db = getPrismaForEstate(estateId);

  const result: ImportResult = { imported: 0, skipped: 0, errors: [] };

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    const name = row[nameIdx]?.trim();
    const unitId = row[unitIdx]?.trim();
    const phone = row[phoneIdx]?.trim();
    const email = emailIdx >= 0 ? row[emailIdx]?.trim() || undefined : undefined;
    const typeRaw = typeIdx >= 0 ? row[typeIdx]?.trim().toUpperCase() : "TENANT";
    const type = typeRaw === "LANDLORD" ? "LANDLORD" : "TENANT";

    if (!name) {
      result.errors.push({ row: rowNum, reason: "Missing name" });
      result.skipped++;
      continue;
    }
    if (!unitId) {
      result.errors.push({ row: rowNum, reason: "Missing unit_id" });
      result.skipped++;
      continue;
    }
    if (!phone) {
      result.errors.push({ row: rowNum, reason: "Missing phone" });
      result.skipped++;
      continue;
    }

    const residentData: ResidentRow = { name, unit_id: unitId, phone, email, type };
    void residentData;

    try {
      await db.resident.upsert({
        where: { estateId_unitId: { estateId, unitId } },
        create: { estateId, unitId, name, phone, email, type: type as "LANDLORD" | "TENANT" },
        update: { name, phone, email, type: type as "LANDLORD" | "TENANT", isActive: true },
      });
      result.imported++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      result.errors.push({ row: rowNum, reason: msg });
      result.skipped++;
    }
  }

  return NextResponse.json(result, { status: 200 });
}
