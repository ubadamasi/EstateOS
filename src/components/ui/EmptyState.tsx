interface EmptyStateProps {
  message: string;
  context?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ message, context, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-[var(--text-subtle)] text-[32px] mb-3" aria-hidden="true">
        —
      </div>
      <p className="text-[14px] font-semibold text-[var(--text)] mb-1">{message}</p>
      {context && (
        <p className="text-[13px] text-[var(--text-muted)] mb-4 max-w-xs">{context}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-4 py-2 bg-[var(--navy)] text-white text-[13px] font-semibold rounded-[6px] min-h-[44px]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
