import { RefreshCw, AlertTriangle } from "lucide-react";

export function ErrorCard({ message = "불러오지 못했어요", onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div
      className="flex flex-col items-center gap-2.5 border border-[var(--color-line)] bg-[var(--color-paper-dim)] px-5 py-6 text-center"
      style={{ borderRadius: "var(--radius-card)" }}
    >
      <AlertTriangle size={22} strokeWidth={1.8} color="var(--color-ink-soft)" aria-hidden="true" />
      <p className="text-[12.5px] font-bold text-[var(--color-ink)]">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-1.5 border-[1.5px] border-[var(--color-ink)] px-3.5 py-2 text-[11px] font-bold text-[var(--color-ink)]"
        style={{ borderRadius: "var(--radius-btn)" }}
      >
        <RefreshCw size={13} aria-hidden="true" />
        다시 시도
      </button>
    </div>
  );
}
