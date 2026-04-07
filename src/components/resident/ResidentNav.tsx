"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ProfileMenu } from "@/components/ui/ProfileMenu";

const NAV_ITEMS = [
  {
    href: "/home",
    label: "Home",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: "/my-levies",
    label: "My Levies",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
];

export function ResidentTopBar({
  userName,
  userEmail,
  estateName,
}: {
  userName: string;
  userEmail: string;
  estateName: string;
}) {
  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : userEmail.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-[#0f2d5c] h-14 flex items-center justify-between px-5">
      <div className="flex items-center gap-[10px]">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-extrabold text-[14px] text-[#0f2d5c] flex-shrink-0">
          EO
        </div>
        <span className="text-white font-bold text-[16px]">EstateOS</span>
        <span className="text-white/60 text-[12px] hidden sm:inline">
          · {estateName}
        </span>
      </div>
      <ProfileMenu
        userInitials={initials}
        userName={userName}
        userEmail={userEmail}
      />
    </header>
  );
}

export function ResidentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 bg-white border-r border-[#e2e8f0] min-h-full">
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${
                active
                  ? "bg-[#0f2d5c] text-white"
                  : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
              }`}
            >
              <span className={active ? "text-white" : "text-[#94a3b8]"}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-[#e2e8f0]">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full text-left text-[13px] text-[#64748b] hover:text-[#dc2626] font-semibold transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}

export function ResidentBottomTabs() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e2e8f0] z-40"
      aria-label="Main navigation"
    >
      <div className="flex">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[56px] text-[10px] font-semibold transition-colors ${
                active ? "text-[#0f2d5c]" : "text-[#64748b] hover:text-[#0f172a]"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className="text-[20px] leading-none" aria-hidden>{icon}</span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
