import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getPrismaForEstate } from "@/lib/prisma";
import { prisma } from "@/lib/prisma";
import { ChairmanNav } from "@/components/chairman/ChairmanNav";
import { ChairmanSidebar } from "@/components/chairman/ChairmanSidebar";

export default async function ChairmanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (
    session.user.role !== "ESTATE_MANAGER" &&
    session.user.role !== "PLATFORM_ADMIN"
  )
    redirect("/");

  const isAdmin = session.user.role === "PLATFORM_ADMIN";

  if (!session.user.estateId && !isAdmin) redirect("/login");

  // Fetch estate name for the top bar
  let estateName = "EstateOS";
  if (session.user.estateId) {
    const estate = await getPrismaForEstate(session.user.estateId).estate.findUnique({
      where: { id: session.user.estateId },
      select: { name: true },
    });
    estateName = estate?.name ?? "EstateOS";
  } else if (isAdmin) {
    estateName = "Platform Admin";
  }

  // Fetch full user info for profile menu
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true },
  });

  const userName = user?.name ?? "";
  const userEmail = user?.email ?? session.user.email ?? "";
  const userPhone = user?.phone ?? "";
  const userInitials = userName
    ? userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : userEmail.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col min-h-screen">
      <ChairmanNav
        estateName={estateName}
        userInitials={userInitials}
        userName={userName}
        userEmail={userEmail}
        userPhone={userPhone}
      />
      <div className="flex flex-1 min-h-0">
        <ChairmanSidebar role={session.user.role} />
        <main className="flex-1 min-w-0 pb-20 md:pb-0 bg-[#f1f5f9]">
          {children}
        </main>
      </div>
      {!isAdmin && <ChairmanBottomTabs />}
    </div>
  );
}

function ChairmanBottomTabs() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-[#ffffff] border-t border-[#e2e8f0] flex md:hidden z-40"
      aria-label="Main navigation"
    >
      {[
        { href: "/dashboard", label: "Dashboard", icon: "⊞" },
        { href: "/levies", label: "Levies", icon: "≡" },
        { href: "/expenses", label: "Expenses", icon: "₦" },
        { href: "/settings", label: "Settings", icon: "⚙" },
      ].map(({ href, label, icon }) => (
        <a
          key={href}
          href={href}
          className="flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] text-[#64748b] text-[10px] font-semibold"
        >
          <span className="text-[18px]" aria-hidden="true">
            {icon}
          </span>
          {label}
        </a>
      ))}
    </nav>
  );
}
