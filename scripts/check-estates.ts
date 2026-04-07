import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/index.js";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter } as never);

  const estates = await prisma.estate.findMany({
    include: { managers: { include: { user: { select: { email: true, role: true } } } } },
  });

  console.log("=== Estates ===");
  for (const e of estates) {
    console.log(`[${e.status}] ${e.name} (${e.id})`);
    if (e.managers.length === 0) console.log("  No managers assigned");
    for (const m of e.managers) console.log(`  Manager: ${m.user.email} (${m.user.role})`);
  }

  if (estates.length === 0) console.log("No estates found — create one via /admin");
  await prisma.$disconnect();
}
main().catch(console.error);
