import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { ScreenScroll } from "../components/common/ScreenScroll";
import { SectionHead } from "../components/common/SectionHead";

const WEEKS = 12;
// Single accent hue, four intensity steps — no other colors mixed in, per
// the design rule that accent orange is the only "data" color in the app.
const LEVEL_OPACITY = [0.08, 0.35, 0.65, 1];

export function ActivityView() {
  const navigate = useNavigate();
  const activityLog = useAppStore((s) => s.activityLog);
  const activitySet = new Set(activityLog);

  const totalDays = WEEKS * 7;
  const days = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (totalDays - 1 - i));
    return d;
  });
  const columns: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) columns.push(days.slice(i, i + 7));

  const activeDaysCount = days.filter((d) => activitySet.has(d.toISOString().slice(0, 10))).length;

  return (
    <ScreenScroll>
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="뒤로가기"
        className="mb-4 flex h-8 w-8 items-center justify-center border-[1.5px] border-[var(--color-ink)]"
        style={{ borderRadius: "var(--radius-avatar)" }}
      >
        <ChevronLeft size={16} strokeWidth={2} color="var(--color-ink)" aria-hidden="true" />
      </button>

      <div className="text-xl font-semibold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
        내 활동 내역
      </div>
      <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">최근 12주 동안 {activeDaysCount}일 활동했어요</p>

      <SectionHead title="낭독 · 스크롤 · 퀴즈 참여" />
      <div className="flex gap-1 overflow-x-auto pb-1">
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-1">
            {col.map((d, dIdx) => {
              const key = d.toISOString().slice(0, 10);
              const active = activitySet.has(key);
              return (
                <div
                  key={dIdx}
                  title={key}
                  className="h-2.5 w-2.5"
                  style={{
                    borderRadius: "2px",
                    background: "var(--color-accent)",
                    opacity: active ? LEVEL_OPACITY[3] : LEVEL_OPACITY[0],
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-[var(--color-ink-soft)]">
        적음
        {LEVEL_OPACITY.map((op, i) => (
          <span key={i} className="h-2.5 w-2.5" style={{ borderRadius: "2px", background: "var(--color-accent)", opacity: op }} />
        ))}
        많음
      </div>
    </ScreenScroll>
  );
}
