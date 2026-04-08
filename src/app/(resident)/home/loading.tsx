import { Skeleton } from "@/components/ui/Skeleton";

export default function ResidentHomeLoading() {
  return (
    <div className="max-w-[700px] mx-auto px-5 py-6">
      {/* Welcome */}
      <div className="mb-5">
        <Skeleton className="h-5 w-36 mb-1.5" />
        <Skeleton className="h-3 w-48" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-sm">
            <Skeleton className="h-2.5 w-20 mb-2" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>

      {/* Levy payments */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden shadow-sm divide-y divide-[#e2e8f0]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-[14px] py-[13px]">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-2.5 w-24" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent expenses */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden shadow-sm divide-y divide-[#e2e8f0]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-[14px] py-[12px]">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-10 rounded" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
