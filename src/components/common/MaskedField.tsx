import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function mask(value: string, mode: "partial" | "full") {
  if (mode === "full") return "•".repeat(Math.min(value.length, 10));
  const at = value.indexOf("@");
  if (at > 0) return `${value.slice(0, Math.min(2, at))}${"*".repeat(at - Math.min(2, at))}${value.slice(at)}`;
  if (value.length <= 4) return "*".repeat(value.length);
  return `${value.slice(0, 2)}${"*".repeat(value.length - 4)}${value.slice(-2)}`;
}

// Tap-to-reveal row for sensitive values (email, phone, account, address).
// Shared by ProfileView (개인정보) and SettingsView (계좌 등) so masking
// behavior stays consistent everywhere it's used.
export function MaskedField({ label, value, mode = "partial" }: { label: string; value: string; mode?: "partial" | "full" }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setRevealed((v) => !v)}
      className="flex w-full items-center justify-between gap-3 border-t border-[var(--color-line)] py-3 text-left first:border-t-0"
    >
      <span className="text-[11.5px] text-[var(--color-ink-soft)]">{label}</span>
      <span className="flex items-center gap-1.5">
        <span className="font-mono text-[12.5px] font-semibold text-[var(--color-ink)]">{revealed ? value : mask(value, mode)}</span>
        {revealed ? (
          <EyeOff size={14} strokeWidth={1.8} color="var(--color-ink-soft)" aria-hidden="true" />
        ) : (
          <Eye size={14} strokeWidth={1.8} color="var(--color-ink-soft)" aria-hidden="true" />
        )}
      </span>
    </button>
  );
}
