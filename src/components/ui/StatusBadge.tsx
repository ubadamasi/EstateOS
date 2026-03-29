import { PaymentStatus } from "@prisma/client";

const config: Record<
  PaymentStatus | "overdue",
  { label: string; className: string }
> = {
  PAID: {
    label: "Paid",
    className: "bg-[var(--green-light)] text-[var(--green)]",
  },
  UNPAID: {
    label: "Unpaid",
    className: "bg-[var(--red-light)] text-[var(--red)]",
  },
  PENDING_REVIEW: {
    label: "Pending review",
    className: "bg-[var(--amber-light)] text-[var(--amber)]",
  },
  DISPUTED: {
    label: "Disputed",
    className: "bg-[var(--purple-light)] text-[var(--purple)]",
  },
  overdue: {
    label: "Overdue",
    className: "bg-[#fff1f2] text-[#be123c]",
  },
};

interface StatusBadgeProps {
  status: PaymentStatus | "overdue";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = config[status];
  return (
    <span
      className={`inline-flex items-center px-[10px] py-[3px] rounded-[20px] text-[11px] font-semibold whitespace-nowrap ${className}`}
      aria-label={`Status: ${label}`}
    >
      {label}
    </span>
  );
}
