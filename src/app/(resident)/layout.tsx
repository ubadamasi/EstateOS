import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ResidentNav } from "@/components/resident/ResidentNav";

export default async function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");
  if (session.user.role !== "RESIDENT") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-20 md:pb-0">
      <ResidentNav />
      <main>{children}</main>
    </div>
  );
}
