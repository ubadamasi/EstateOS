import { UserRole } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      estateId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}
