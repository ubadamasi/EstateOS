/**
 * Dev seed — creates users with passwords for local development.
 * Run:  npm run db:seed
 */

import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DEV_PASSWORD = "password123";

async function main() {
  console.log("🌱  Seeding dev data...\n");

  const hash = await bcrypt.hash(DEV_PASSWORD, 10);

  // ── Estate ────────────────────────────────────────────────
  const estate = await prisma.estate.upsert({
    where: { publicToken: "dev-estate-public-token" },
    update: {},
    create: {
      name: "Green Meadows Estate",
      address: "12 Bode Thomas Street",
      city: "Lagos",
      state: "Lagos",
      unitCount: 40,
      status: "ACTIVE",
      publicToken: "dev-estate-public-token",
    },
  });
  console.log(`  ✓  Estate: ${estate.name}`);

  // ── Chairman (ESTATE_MANAGER) ─────────────────────────────
  const chairman = await prisma.user.upsert({
    where: { email: "chairman@estateos.test" },
    update: { passwordHash: hash },
    create: {
      email: "chairman@estateos.test",
      name: "Dev Chairman",
      role: "ESTATE_MANAGER",
      emailVerified: new Date(),
      passwordHash: hash,
    },
  });
  await prisma.estateManager.upsert({
    where: { userId: chairman.id },
    update: {},
    create: { userId: chairman.id, estateId: estate.id, title: "Chairman" },
  });
  console.log(`  ✓  Chairman: ${chairman.email}`);

  // ── Platform Admin ────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@estateos.test" },
    update: { passwordHash: hash },
    create: {
      email: "admin@estateos.test",
      name: "Dev Platform Admin",
      role: "PLATFORM_ADMIN",
      emailVerified: new Date(),
      passwordHash: hash,
    },
  });
  console.log(`  ✓  Admin: ${admin.email}`);

  console.log("\n" + "─".repeat(60));
  console.log("  Dev credentials (all use password: password123)");
  console.log("  Chairman  →  chairman@estateos.test");
  console.log("  Admin     →  admin@estateos.test");
  console.log("─".repeat(60));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
