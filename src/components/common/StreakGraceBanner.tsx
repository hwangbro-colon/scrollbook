import { useEffect, useState } from "react";

function todayKey() {
  const d = new Date();
  return `bb-streak-banner-dismissed-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// Shown when the user has an active streak but hasn't done today's
// challenge yet — i.e. today is the last grace day before the streak
// breaks. Dismissible, resets automatically the next calendar day.
export function StreakGraceBanner({ streak }: { streak: number }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(todayKey()) === "1");
  }, []);

  if (dismissed) return null;

  return (
    <div
      className="mt-3 flex items-center justify-between gap-3 px-4 py-2.5"
      style={{ borderRadius: "var(--radius-card)", background: "var(--color-accent-tint)", border: "1.5px solid var(--color-accent)" }}
    >
      <p className="text-[12px] font-semibold text-[var(--color-ink)]">
        🔥 {streak}일 연속 기록 — 오늘 안에 하면 스트릭 유지돼요!
      </p>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(todayKey(), "1");
          setDismissed(true);
        }}
        aria-label="배너 닫기"
        className="flex-none text-[15px] font-bold leading-none text-[var(--color-accent)]"
      >
        ×
      </button>
    </div>
  );
}
