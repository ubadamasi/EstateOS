import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const basePrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = basePrisma;

/**
 * Prisma client with RLS middleware.
 *
 * Before every query, sets the PostgreSQL session variable
 * `app.current_estate_id` so RLS policies can filter rows by estate.
 *
 * Usage:
 *   import { getPrismaForEstate } from "@/lib/prisma"
 *   const prisma = getPrismaForEstate(estateId)
 *   // All queries on this client are scoped to that estate via RLS
 *
 * For queries that don't need estate scoping (e.g. platform admin, auth),
 * import `prisma` directly — no RLS middleware applied.
 */
export function getPrismaForEstate(estateId: string) {
  return basePrisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          // Set the RLS context variable for this transaction
          const [, result] = await basePrisma.$transaction([
            basePrisma.$executeRawUnsafe(
              `SET LOCAL app.current_estate_id = '${estateId.replace(/'/g, "''")}'`
            ),
            query(args) as never,
          ]);
          return result;
        },
      },
    },
  });
}

/**
 * Base prisma client — no RLS middleware.
 * Use for: NextAuth operations, platform admin queries, public summary page.
 */
export const prisma = basePrisma;

export type PrismaForEstate = ReturnType<typeof getPrismaForEstate>;
