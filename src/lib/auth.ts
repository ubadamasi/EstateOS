import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // `user` is only present on first sign-in
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;

        // Fetch estateId and attach to token
        const role = (user as { role: string }).role;
        if (role === "ESTATE_MANAGER") {
          const manager = await prisma.estateManager.findUnique({
            where: { userId: user.id },
            select: { estateId: true },
          });
          token.estateId = manager?.estateId ?? null;
        } else if (role === "RESIDENT") {
          const resident = await prisma.resident.findFirst({
            where: { userId: user.id },
            select: { estateId: true },
          });
          token.estateId = resident?.estateId ?? null;
        } else {
          token.estateId = null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as never;
        session.user.estateId = (token.estateId as string | null) ?? null;
      }
      return session;
    },
  },
};
