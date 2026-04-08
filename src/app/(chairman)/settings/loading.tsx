import { Skeleton } from "@/components/ui/Skeleton";

export default function SettingsLoading() {
  return (
    <div className="max-w-[600px] mx-auto px-5 py-6">
      <Skeleton className="h-5 w-20 mb-6" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white border border-[#e2e8f0] rounded-lg p-5 shadow-sm mb-4">
          <Skeleton className="h-4 w-36 mb-4" />
          <div className="flex flex-col gap-3">
            <div>
              <Skeleton className="h-2.5 w-20 mb-1.5" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-2.5 w-24 mb-1.5" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <Skeleton className="h-9 w-28 rounded-lg mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
