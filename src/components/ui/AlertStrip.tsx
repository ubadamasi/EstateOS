interface AlertStripProps {
  pendingReviews: number;
  openDisputes: number;
  onClickReviews?: () => void;
  onClickDisputes?: () => void;
}

export function AlertStrip({
  pendingReviews,
  openDisputes,
  onClickReviews,
  onClickDisputes,
}: AlertStripProps) {
  if (pendingReviews === 0 && openDisputes === 0) return null;

  return (
    <div
      role="alert"
      className="bg-[var(--amber-light)] border-b border-[var(--amber)] px-[var(--page-padding)] py-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] font-semibold text-[var(--amber)]"
    >
      {pendingReviews > 0 && (
        <button
          onClick={onClickReviews}
          className="hover:underline min-h-[44px] flex items-center"
        >
          {pendingReviews} transfer{pendingReviews > 1 ? "s" : ""} pending
          review
        </button>
      )}
      {openDisputes > 0 && (
        <button
          onClick={onClickDisputes}
          className="hover:underline min-h-[44px] flex items-center text-[var(--red)]"
        >
          {openDisputes} open dispute{openDisputes > 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
}
