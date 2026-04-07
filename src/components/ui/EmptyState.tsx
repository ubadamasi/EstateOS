interface EmptyStateProps {
  message: string;
  context?: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ message, context, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-[#94a3b8] text-[32px] mb-3" aria-hidden="true">
        —
      </div>
      <p className="text-[14px] font-semibold text-[#0f172a] mb-1">{message}</p>
      {context && (
        <p className="text-[13px] text-[#64748b] mb-4 max-w-xs">{context}</p>
      )}
      {action && (
        <a
          href={action.href}
          className="mt-2 px-4 py-2 bg-[#0f2d5c] text-white text-[13px] font-semibold rounded-[6px] min-h-[44px] inline-flex items-center"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
