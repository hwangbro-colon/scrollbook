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

// Floats over the scrollable content (glassmorphism only reads as "glass"
// when there's something to blur behind it) — views add bottom clearance
// (see ScreenScroll / ScrollView) so their last item isn't hidden under it.
export function BottomNav() {
  return (
    <nav
      className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-around border-t border-white/50 bg-white/65 px-1 pt-[9px] backdrop-blur-lg backdrop-saturate-150"
      style={{
        paddingBottom: "calc(9px + env(safe-area-inset-bottom, 0px))",
        borderTopLeftRadius: "var(--radius-card)",
        borderTopRightRadius: "var(--radius-card)",
        boxShadow: "0 -8px 24px rgba(20,20,20,0.08)",
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
