// Wordmark matches the design reference exactly: a small accent square
// "dot" + BOOKBOOK text — no image logo in the topbar (see AGENTS notes in
// SplashScreen.tsx for where the swappable image logo is still used).
export function Topbar({ onProfileClick }: { onProfileClick: () => void }) {
  return (
    <header
      className="flex flex-none items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-paper)] px-5 pb-3"
      style={{ paddingTop: "calc(12px + env(safe-area-inset-top, 0px))" }}
    >
      <div className="flex items-center gap-[5px]">
        <span className="h-[7px] w-[7px] rounded-[2px] bg-[var(--color-accent)]" />
        <span
          className="text-[18px] font-bold tracking-[-0.01em] text-[var(--color-ink)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          BOOKBOOK
        </span>
      </div>
      <button
        type="button"
        onClick={onProfileClick}
        aria-label="프로필 열기"
        className="flex h-8 w-8 flex-none items-center justify-center border-[1.5px] border-[var(--color-ink)]"
        style={{ borderRadius: "var(--radius-avatar)" }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-[15px] w-[15px] fill-none"
          style={{ stroke: "var(--color-ink)", strokeWidth: 2 }}
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
        </svg>
      </button>
    </header>
  );
}
