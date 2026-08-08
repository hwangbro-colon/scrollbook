import { Link } from "react-router-dom";
import { Star, Bell, Settings } from "lucide-react";

// Left-to-right per spec: 마일리지 / 알림 / 설정.
const ICONS = [
  { to: "/mileage", icon: Star, label: "마일리지" },
  { to: "/notifications", icon: Bell, label: "알림" },
  { to: "/settings", icon: Settings, label: "설정" },
] as const;

export function Topbar() {
  return (
    <header
      className="flex flex-none items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-nav-cream)] px-5 pb-3"
      style={{ paddingTop: "calc(12px + env(safe-area-inset-top, 0px))" }}
    >
      <div className="flex items-center gap-[5px]">
        <span className="h-[7px] w-[7px] rounded-[2px] bg-[var(--color-accent)]" />
        <span
          className="text-[18px] font-bold tracking-[-0.01em] text-[var(--color-ink)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          북북
        </span>
      </div>
      <div className="flex items-center gap-2">
        {ICONS.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            aria-label={label}
            className="flex h-8 w-8 flex-none items-center justify-center border-[1.5px] border-[var(--color-ink)]"
            style={{ borderRadius: "var(--radius-avatar)" }}
          >
            <Icon size={15} strokeWidth={1.8} color="var(--color-ink)" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </header>
  );
}
