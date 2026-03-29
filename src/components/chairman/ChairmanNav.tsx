interface ChairmanNavProps {
  estateName: string;
  userInitials: string;
}

export function ChairmanNav({ estateName, userInitials }: ChairmanNavProps) {
  return (
    <header
      className="sticky top-0 z-50 bg-[var(--navy)] h-[var(--nav-height)] flex items-center justify-between px-[var(--page-padding)]"
      style={{ height: "var(--nav-height)" }}
    >
      <div className="flex items-center gap-[10px]">
        <div className="w-8 h-8 bg-white rounded-[6px] flex items-center justify-center font-extrabold text-[14px] text-[var(--navy)] flex-shrink-0">
          EO
        </div>
        <span className="text-white font-bold text-[16px]">EstateOS</span>
        <span className="text-white/60 text-[12px] hidden sm:inline">
          · {estateName}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full bg-[var(--green)] flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0"
          aria-hidden="true"
        >
          {userInitials}
        </div>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="text-white/70 text-[12px] hover:text-white hidden sm:block"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
