import { Link } from "react-router-dom";
import { Timer, StickyNote, BookOpen, History } from "lucide-react";
import { ScreenScroll } from "../components/common/ScreenScroll";
import { DailyChallengeCard } from "../components/common/DailyChallengeCard";

// Order matters — 데일리5분(hero) then 독서타이머/메모/어휘노트/읽은책기록,
// top to bottom.
const CARDS = [
  { to: "/assist/timer", icon: Timer, label: "독서타이머", desc: "혼자 읽든 스크롤로 읽든, 시간을 재보세요" },
  { to: "/assist/memo", icon: StickyNote, label: "메모", desc: "떠오른 생각을 자유롭게 남겨보세요" },
  { to: "/assist/vocab", icon: BookOpen, label: "어휘노트", desc: "저장한 단어 · 플래시카드 복습" },
  { to: "/assist/history", icon: History, label: "읽은 책 기록", desc: "지금까지 읽은 책 전체 목록" },
] as const;

export function LibraryHubView() {
  return (
    <ScreenScroll>
      <div className="text-xl font-semibold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
        독서보조
      </div>
      <p className="mb-4 mt-0.5 text-xs text-[var(--color-ink-soft)]">데일리 5분 · 타이머 · 메모 · 어휘노트 · 기록</p>

      <DailyChallengeCard variant="compact" />

      <div className="mt-3 flex flex-col gap-3">
        {CARDS.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="flex items-center gap-3.5 border-[1.5px] border-[var(--color-ink)] p-4"
            style={{ borderRadius: "var(--radius-card)" }}
          >
            <div
              className="flex h-11 w-11 flex-none items-center justify-center border-[1.5px] border-[var(--color-accent)] bg-[var(--color-accent-tint)]"
              style={{ borderRadius: "12px" }}
            >
              <item.icon size={19} strokeWidth={1.8} color="var(--color-accent)" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h5 className="text-[14px] font-bold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
                {item.label}
              </h5>
              <p className="mt-0.5 text-[11px] text-[var(--color-ink-soft)]">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </ScreenScroll>
  );
}
