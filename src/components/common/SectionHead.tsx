export function SectionHead({
  title,
  action,
  onAction,
  first = false,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  first?: boolean;
}) {
  return (
    <div className={`flex items-baseline justify-between ${first ? "mb-3 mt-0" : "mb-3 mt-[22px]"}`}>
      <h4 className="text-[15px] font-semibold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </h4>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="text-[11px] font-bold text-[var(--color-ink-soft)]"
        >
          {action}
        </button>
      )}
    </div>
  );
}
