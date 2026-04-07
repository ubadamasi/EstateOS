import { PaymentStatus } from "@/generated/prisma/enums";

const config: Record<
  PaymentStatus | "overdue",
  { label: string; className: string }
> = {
  PAID: {
    label: "Paid",
    className: "bg-[#dcfce7] text-[#16a34a]",
  },
  UNPAID: {
    label: "Unpaid",
    className: "bg-[#fee2e2] text-[#dc2626]",
  },
  PENDING_REVIEW: {
    label: "Pending review",
    className: "bg-[#fef3c7] text-[#d97706]",
  },
  DISPUTED: {
    label: "Disputed",
    className: "bg-[#ede9fe] text-[#7c3aed]",
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
