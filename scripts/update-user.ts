import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as never);

async function main() {
  const hash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.update({
    where: { email: "ubadamasi@gmail.com" },
    data: {
      name: "Usman Badamasi",
      phone: "07033773336",
      passwordHash: hash,
    },
  });

  console.log("✓ Updated:", user.email, "|", user.name, "|", user.phone);
  await prisma.$disconnect();
}

main().catch(console.error);
