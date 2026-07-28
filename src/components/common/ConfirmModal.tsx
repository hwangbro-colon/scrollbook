export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "확인",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[var(--color-ink)]/40 px-6" role="dialog" aria-modal="true">
      <div
        className="w-full max-w-xs border border-[var(--color-line)] bg-[var(--color-paper)] p-5 shadow-lg"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <p className="text-[15px] font-semibold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </p>
        <p className="mt-2 text-[12.5px] leading-[1.5] text-[var(--color-ink-soft)]">{message}</p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border-[1.5px] border-[var(--color-ink)] py-2.5 text-[12.5px] font-bold text-[var(--color-ink)]"
            style={{ borderRadius: "var(--radius-btn)" }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-[var(--color-accent)] py-2.5 text-[12.5px] font-bold text-white"
            style={{ borderRadius: "var(--radius-btn)" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
