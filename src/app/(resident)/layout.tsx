import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ResidentTopBar, ResidentSidebar, ResidentBottomTabs } from "@/components/resident/ResidentNav";

export default async function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");
  if (session.user.role !== "RESIDENT") redirect("/dashboard");

  // Fetch estate name for the top bar
  let estateName = "EstateOS";
  if (session.user.estateId) {
    const estate = await prisma.estate.findUnique({
      where: { id: session.user.estateId },
      select: { name: true },
    });
    estateName = estate?.name ?? "EstateOS";
  }

  const userName = session.user.name ?? "";
  const userEmail = session.user.email ?? "";

  const userRecord = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { phone: true },
  });
  const userPhone = userRecord?.phone ?? "";

  return (
    <div className="flex flex-col min-h-screen">
      <ResidentTopBar userName={userName} userEmail={userEmail} userPhone={userPhone} estateName={estateName} />
      <div className="flex flex-1 min-h-0">
        <ResidentSidebar />
        <main className="flex-1 min-w-0 pb-20 md:pb-0 bg-[#f1f5f9]">
          {children}
        </main>
      </div>
      <ResidentBottomTabs />
    </div>
  );
}
