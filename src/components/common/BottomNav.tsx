import { NavLink } from "react-router-dom";
import { BookOpenText, Library, Sparkles, User } from "lucide-react";

// Fixed order per spec: 북북(홈) / 책장 / (확장) / 프로필.
const TABS = [
  { to: "/", label: "북북", icon: BookOpenText, end: true },
  { to: "/library", label: "책장", icon: Library, end: false },
  { to: "/expansion", label: "확장", icon: Sparkles, end: false },
  { to: "/profile", label: "프로필", icon: User, end: false },
] as const;

// Floating bar — inset from all edges, positioned `absolute` within AppShell
// so it sits *outside* every view's own scroll container. Border-radius 0
// per the buttons-are-sharp rule doesn't apply here (this is a nav bar, not
// a button), so it keeps the card radius like every other surface.
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
        border: "1px solid var(--color-line)",
        boxShadow: "0 8px 28px rgba(10,10,10,.12)",
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
