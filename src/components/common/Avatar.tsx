export function Avatar({ letter, size = 30, className = "" }: { letter: string; size?: number; className?: string }) {
  return (
    <div
      className={`flex flex-none items-center justify-center border-[1.5px] border-[var(--color-ink)] bg-[var(--color-paper-dim)] text-[11px] font-bold text-[var(--color-ink)] ${className}`}
      style={{ width: size, height: size, borderRadius: "var(--radius-avatar)" }}
    >
      {letter}
    </div>
  );
}
