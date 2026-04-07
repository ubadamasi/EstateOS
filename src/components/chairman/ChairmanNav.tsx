import { ProfileMenu } from "@/components/ui/ProfileMenu";

interface ChairmanNavProps {
  estateName: string;
  userInitials: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
}

export function ChairmanNav({
  estateName,
  userInitials,
  userName,
  userEmail,
  userPhone,
}: ChairmanNavProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#0f2d5c] h-14 flex items-center justify-between px-5">
      <div className="flex items-center gap-[10px]">
        <div className="w-8 h-8 bg-white rounded-[6px] flex items-center justify-center font-extrabold text-[14px] text-[#0f2d5c] flex-shrink-0">
          EO
        </div>
        <span className="text-white font-bold text-[16px]">EstateOS</span>
        <span className="text-white/60 text-[12px] hidden sm:inline">
          · {estateName}
        </span>
      </div>
      <ProfileMenu
        userInitials={userInitials}
        userName={userName}
        userEmail={userEmail}
        userPhone={userPhone}
      />
    </header>
  );
}
