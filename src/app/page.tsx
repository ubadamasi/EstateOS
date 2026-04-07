import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  switch (session.user.role) {
    case "ESTATE_MANAGER":
      redirect("/dashboard");
    case "PLATFORM_ADMIN":
      redirect("/admin");
    case "RESIDENT":
    default:
      redirect("/home");
  }
}
