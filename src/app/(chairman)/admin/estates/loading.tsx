import { Skeleton } from "@/components/ui/Skeleton";

export default function EstatesLoading() {
  return (
    <div className="max-w-[1000px] mx-auto px-5 py-6">
      <div className="flex items-center justify-between mb-5">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden shadow-sm">
        <div className="bg-[#f8fafc] px-[14px] py-[10px] border-b border-[#e2e8f0] flex gap-6">
          {["w-32", "w-24", "w-16", "w-20", "w-20", "w-16"].map((w, i) => (
            <Skeleton key={i} className={`h-2.5 ${w}`} />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-6 items-center px-[14px] py-[13px] border-b border-[#e2e8f0] last:border-b-0">
            <div className="flex flex-col gap-1.5 w-36">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2.5 w-24" />
            </div>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-20 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
