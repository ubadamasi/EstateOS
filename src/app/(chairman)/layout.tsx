import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ChairmanNav } from "@/components/chairman/ChairmanNav";

export default async function ChairmanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role !== "ESTATE_MANAGER") redirect("/");

  return (
    <div className="flex flex-col min-h-full">
      <ChairmanNav
        estateName="Loading..."
        userInitials={
          session.user.name
            ? session.user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : "?"
        }
      />
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      {/* Mobile bottom tab bar */}
      <ChairmanBottomTabs />
    </div>
  );
}

function ChairmanBottomTabs() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-[var(--surface)] border-t border-[var(--border)] flex md:hidden z-40"
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
          className="flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] text-[var(--text-muted)] text-[10px] font-semibold"
        >
          <span className="text-[18px]" aria-hidden="true">{icon}</span>
          {label}
        </a>
      ))}
    </nav>
  );
}
