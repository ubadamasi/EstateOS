import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/index.js";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter } as never);

  // Simulate exactly what the session callback does
  const devToken = "dev-session-chairman-do-not-use-in-production";

  const result = await prisma.session.findUnique({
    where: { sessionToken: devToken },
    include: { user: true },
  });

  if (!result) {
    console.log("✗ Session not found - run npm run db:seed");
    return;
  }

  const { user } = result;
  console.log("✓ Session user:", user.email, "| role:", user.role);

  // Now simulate the session callback estateId lookup
  const manager = await prisma.estateManager.findUnique({
    where: { userId: user.id },
    select: { estateId: true },
  });

  console.log("EstateManager lookup result:", manager);

  if (!manager) {
    console.log("✗ No EstateManager record found for user", user.id);
    // List all estate managers
    const all = await prisma.estateManager.findMany();
    console.log("All EstateManagers:", all);
  } else {
    console.log("✓ estateId:", manager.estateId);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
