import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="max-w-[1000px] mx-auto px-5 py-6">
      <Skeleton className="h-5 w-40 mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-sm">
            <Skeleton className="h-2.5 w-20 mb-2" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>
      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden shadow-sm">
        <div className="bg-[#f8fafc] px-[14px] py-[10px] border-b border-[#e2e8f0] flex gap-6">
          {["w-32", "w-24", "w-20", "w-16"].map((w, i) => (
            <Skeleton key={i} className={`h-2.5 ${w}`} />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-6 items-center px-[14px] py-[13px] border-b border-[#e2e8f0] last:border-b-0">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
