/**
 * Custom NextAuth v4 Prisma adapter.
 * @auth/prisma-adapter v2 has a broken updateUser that omits the `data:` wrapper,
 * causing a Prisma validation error that surfaces as error=Callback.
 */
import type { Adapter } from "next-auth/adapters";
import { prisma } from "@/lib/prisma";

export function CustomPrismaAdapter(): Adapter {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createUser: ({ id: _id, ...data }: any) => prisma.user.create({ data }),
    getUser: (id) => prisma.user.findUnique({ where: { id } }),
    getUserByEmail: (email) => prisma.user.findUnique({ where: { email } }),
    async getUserByAccount(provider_providerAccountId) {
      const account = await prisma.account.findUnique({
        where: { provider_providerAccountId },
        include: { user: true },
      });
      return account?.user ?? null;
    },
    updateUser: ({ id, ...data }) =>
      prisma.user.update({ where: { id }, data }),
    deleteUser: (id) => prisma.user.delete({ where: { id } }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    linkAccount: (data: any) => prisma.account.create({ data }) as never,
    unlinkAccount: (provider_providerAccountId) =>
      prisma.account.delete({ where: { provider_providerAccountId } }) as never,
    async getSessionAndUser(sessionToken) {
      const result = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!result) return null;
      const { user, ...session } = result;
      return { user, session };
    },
    createSession: (data) => prisma.session.create({ data }),
    updateSession: ({ sessionToken, ...data }) =>
      prisma.session.update({ where: { sessionToken }, data }),
    deleteSession: (sessionToken) =>
      prisma.session.delete({ where: { sessionToken } }),
    async createVerificationToken(data) {
      return prisma.verificationToken.create({ data });
    },
    async useVerificationToken({ identifier, token }) {
      try {
        return await prisma.verificationToken.delete({
          where: { identifier_token: { identifier, token } },
        });
      } catch {
        return null;
      }
    },
  };
}
