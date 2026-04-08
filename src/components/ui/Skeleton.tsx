export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-[#e2e8f0] rounded ${className}`}
    />
  );
}
