import { Skeleton } from "@/components/ui/Skeleton";

export default function LevyDetailLoading() {
  return (
    <div className="max-w-[900px] mx-auto px-5 py-6">
      <Skeleton className="h-3 w-20 mb-4" />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-sm">
            <Skeleton className="h-2.5 w-20 mb-2" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>

      {/* Payments table */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden shadow-sm">
        <div className="bg-[#f8fafc] px-[14px] py-[10px] border-b border-[#e2e8f0] flex gap-6">
          {["w-24", "w-16", "w-16", "w-20", "w-20"].map((w, i) => (
            <Skeleton key={i} className={`h-2.5 ${w}`} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-6 items-center px-[14px] py-[13px] border-b border-[#e2e8f0] last:border-b-0">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="h-5 w-20 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
