import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 border border-dashed border-[var(--color-line)] px-5 py-8 text-center" style={{ borderRadius: "var(--radius-card)" }}>
      <Icon size={26} strokeWidth={1.6} color="var(--color-ink-soft)" aria-hidden="true" />
      <p className="text-[12.5px] font-bold text-[var(--color-ink)]">{title}</p>
      {description && <p className="text-[11.5px] text-[var(--color-ink-soft)]">{description}</p>}
      {action}
    </div>
  );
}
