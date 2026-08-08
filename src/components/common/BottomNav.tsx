import { NavLink } from "react-router-dom";
import { Home, Mic, ChevronsDown, Users, BookOpen } from "lucide-react";

// Fixed order per spec: 홈 / 낭독 / 스크롤 / 그룹 / 독서보조
const TABS = [
  { to: "/", label: "홈", icon: Home, end: true },
  { to: "/reading", label: "낭독", icon: Mic, end: false },
  { to: "/scroll", label: "스크롤", icon: ChevronsDown, end: false },
  { to: "/friends", label: "그룹", icon: Users, end: false },
  { to: "/assist", label: "독서보조", icon: BookOpen, end: false },
] as const;

// Truly floating glass bar — inset from all edges (not just flush to the
// bottom) and rounded on all 4 corners, positioned `absolute` within
// AppShell so it sits *outside* every view's own scroll container. That
// means it stays put above whatever's currently in view no matter how far
// any tab is scrolled — nothing here needs to react to scroll position.
export function BottomNav() {
  return (
    <nav
      className="absolute inset-x-3 z-10 flex items-center justify-around px-1 py-[9px]"
      style={{
        bottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
        borderRadius: "var(--radius-card)",
        background: "var(--color-nav-cream-glass)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid rgba(255,255,255,.55)",
        boxShadow: "0 8px 28px rgba(20,20,20,.16)",
      }}
    >
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          aria-label={label}
          className={({ isActive }) =>
            `flex flex-col items-center gap-[3px] px-2 py-1 text-[9.5px] font-bold ${
              isActive ? "text-[var(--color-ink)]" : "text-[var(--color-ink-soft)]"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={21} strokeWidth={1.8} color={isActive ? "var(--color-accent)" : "currentColor"} aria-hidden="true" />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
