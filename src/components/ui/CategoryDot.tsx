import { ExpenseCategory } from "@/generated/prisma/enums";

const colors: Record<ExpenseCategory, string> = {
  SECURITY: "#3b82f6",
  MAINTENANCE: "#f59e0b",
  UTILITIES: "#10b981",
  ADMINISTRATION: "#8b5cf6",
  OTHER: "#94a3b8",
};

const labels: Record<ExpenseCategory, string> = {
  SECURITY: "Security",
  MAINTENANCE: "Maintenance",
  UTILITIES: "Utilities",
  ADMINISTRATION: "Administration",
  OTHER: "Other",
};

interface CategoryDotProps {
  category: ExpenseCategory;
  showLabel?: boolean;
}

export function CategoryDot({ category, showLabel = true }: CategoryDotProps) {
  return (
    <span className="inline-flex items-center gap-[6px]">
      <span
        className="inline-block w-[10px] h-[10px] rounded-full flex-shrink-0"
        style={{ background: colors[category] }}
        aria-hidden="true"
      />
      {showLabel && (
        <span className="text-[13px] text-[#0f172a]">{labels[category]}</span>
      )}
    </span>
  );
}

export { labels as categoryLabels, colors as categoryColors };
