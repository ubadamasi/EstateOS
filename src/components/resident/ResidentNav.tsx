"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/home", label: "Home", icon: "⊞" },
  { href: "/my-levies", label: "Levies", icon: "₦" },
];

export function ResidentNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden md:flex items-center justify-between px-6 py-3 bg-[var(--navy)] text-white shadow-md sticky top-0 z-40">
        <Link href="/home" className="font-bold text-[16px] tracking-tight">
          EstateOS
        </Link>
        <div className="flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[13px] font-semibold transition-colors ${
                pathname.startsWith(item.href)
                  ? "text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border)] z-40"
        aria-label="Main navigation"
      >
        <div className="flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[56px] text-[10px] font-semibold transition-colors ${
                  active
                    ? "text-[var(--navy)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className="text-[20px] leading-none" aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
