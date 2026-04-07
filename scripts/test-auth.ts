import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/index.js";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter } as never);

  // List all verification tokens
  const tokens = await prisma.verificationToken.findMany();
  console.log("=== VerificationTokens ===");
  for (const t of tokens) console.log(t);

  if (tokens.length === 0) {
    console.log("No tokens to test with.");
    return;
  }

  // Try to delete the first token using compound key
  const first = tokens[0];
  console.log("\n=== Testing useVerificationToken ===");
  console.log(`Deleting: identifier=${first.identifier} token=${first.token.slice(0, 20)}...`);

  try {
    const deleted = await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: first.identifier, token: first.token } },
    });
    console.log("✓ Delete succeeded:", deleted.identifier);
  } catch (e) {
    console.error("✗ Delete failed:", e);
  }

  // Check session + user lookup
  console.log("\n=== Testing getSessionAndUser ===");
  const devToken = "dev-session-chairman-do-not-use-in-production";
  const result = await prisma.session.findUnique({
    where: { sessionToken: devToken },
    include: { user: true },
  });
  if (result) {
    const { user, ...session } = result;
    console.log("✓ Session found:", session.sessionToken.slice(0, 20));
    console.log("  User:", user.email, "role:", user.role);
  } else {
    console.log("✗ Dev session not found");
  }

  await prisma.$disconnect();
}

main().catch(console.error);
