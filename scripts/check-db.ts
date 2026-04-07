import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/index.js";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter } as never);

  const sessions = await prisma.session.findMany({ include: { user: true } });
  console.log("\n=== Sessions ===");
  for (const s of sessions) {
    console.log(`token=${s.sessionToken} | user=${s.user.email} | role=${s.user.role} | expires=${s.expires}`);
  }

  const tokens = await prisma.verificationToken.findMany();
  console.log("\n=== VerificationTokens ===", tokens.length, "rows");

  const users = await prisma.user.findMany({ select: { email: true, role: true, emailVerified: true } });
  console.log("\n=== Users ===");
  for (const u of users) console.log(u);

  await prisma.$disconnect();
}

main().catch(console.error);
