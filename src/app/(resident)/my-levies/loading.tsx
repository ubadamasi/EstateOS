import { Skeleton } from "@/components/ui/Skeleton";

export default function MyLeviesLoading() {
  return (
    <div className="max-w-[700px] mx-auto px-5 py-6">
      <Skeleton className="h-5 w-24 mb-5" />

      {/* Status groups */}
      {Array.from({ length: 3 }).map((_, g) => (
        <div key={g} className="mb-6">
          <Skeleton className="h-3 w-20 mb-3" />
          <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden shadow-sm divide-y divide-[#e2e8f0]">
            {Array.from({ length: g === 0 ? 3 : 2 }).map((_, i) => (
              <div key={i} className="px-[14px] py-[14px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-2.5 w-28" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-16 rounded" />
                  </div>
                </div>
                <Skeleton className="h-8 w-32 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
