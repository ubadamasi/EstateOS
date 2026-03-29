import { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { sendMagicLinkEmail } from "@/lib/email";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM!,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        await sendMagicLinkEmail({ to: email, url });
      },
    }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
    error: "/login/error",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;

        // Attach estateId for estate managers
        if (user.role === "ESTATE_MANAGER") {
          const manager = await prisma.estateManager.findUnique({
            where: { userId: user.id },
            select: { estateId: true },
          });
          session.user.estateId = manager?.estateId ?? null;
        }
      }
      return session;
    },
  },
};
