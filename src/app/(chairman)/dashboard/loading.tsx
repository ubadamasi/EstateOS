import { Skeleton } from "@/components/ui/Skeleton";

function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden shadow-sm">
      <div className="bg-[#f8fafc] px-[14px] py-[10px] border-b border-[#e2e8f0] flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-16" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-[14px] py-[13px] border-b border-[#e2e8f0] last:border-b-0">
          <div className="flex flex-col gap-1.5 flex-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2.5 w-20" />
          </div>
          <Skeleton className="h-3 w-16 self-center" />
          <Skeleton className="h-3 w-8 self-center" />
          <Skeleton className="h-5 w-14 rounded self-center" />
        </div>
      ))}
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="max-w-[1200px] mx-auto px-5 py-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-sm">
            <Skeleton className="h-2.5 w-24 mb-2" />
            <Skeleton className="h-6 w-28" />
          </div>
        ))}
      </div>

      {/* Two-column tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <section>
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <TableSkeleton rows={5} cols={4} />
        </section>
        <section>
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <TableSkeleton rows={5} cols={4} />
        </section>
      </div>
    </div>
  );
}
