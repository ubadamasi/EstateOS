import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL!;
  const password = process.env.ADMIN_PASSWORD!;

  const hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: "PLATFORM_ADMIN", passwordHash: hash, emailVerified: new Date() },
    create: {
      email,
      name: "Platform Admin",
      role: "PLATFORM_ADMIN",
      emailVerified: new Date(),
      passwordHash: hash,
    },
  });

  console.log(`Done. User ID: ${user.id}  Role: ${user.role}  Email: ${user.email}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
