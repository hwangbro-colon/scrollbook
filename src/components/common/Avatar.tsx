export function Avatar({
  letter,
  size = 30,
  className = "",
  ring,
}: {
  letter: string;
  size?: number;
  className?: string;
  /** Instagram-story-style ring: "active" (accent) | "inactive" (faint) | omit for none. */
  ring?: "active" | "inactive";
}) {
  return (
    <div
      className={`flex flex-none items-center justify-center border-[1.5px] border-[var(--color-ink)] bg-[var(--color-paper-dim)] text-[11px] font-bold text-[var(--color-ink)] ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: "var(--radius-avatar)",
        boxShadow: ring === "active" ? "0 0 0 2px var(--color-paper), 0 0 0 3.5px var(--color-accent)" : ring === "inactive" ? "0 0 0 2px var(--color-paper), 0 0 0 3.5px var(--color-line)" : undefined,
      }}
    >
      {letter}
    </div>
  );
}
