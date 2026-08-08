import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAppStore } from "../../store/appStore";
import { useMileageStore } from "../../store/mileageStore";
import { useCountdownTo6AM } from "../../hooks/useCountdownTo6AM";

const TOMORROW_PREVIEW = "「별주부전」 3장 · 용궁 잔치";

const SUBMIT_DELAY_MS = 500;
const STREAK_BONUS_EVERY = 7;
const STREAK_BONUS_AMOUNT = 50;

function ClockIcon({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      stroke="var(--color-accent)"
      fill="none"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

export function DailyChallengeCard({ variant }: { variant: "hero" | "compact" }) {
  const dailyChallengeDone = useAppStore((s) => s.dailyChallengeDone);
  const completeDailyChallenge = useAppStore((s) => s.completeDailyChallenge);
  const earnMileage = useMileageStore((s) => s.earnMileage);
  const [submitting, setSubmitting] = useState(false);
  const resetCountdown = useCountdownTo6AM(dailyChallengeDone);

  const handleStart = () => {
    if (dailyChallengeDone || submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      completeDailyChallenge();
      earnMileage(10, "데일리 5분 완료", "daily");
      const newStreak = useAppStore.getState().streak;
      if (newStreak > 0 && newStreak % STREAK_BONUS_EVERY === 0) {
        earnMileage(STREAK_BONUS_AMOUNT, `${newStreak}일 연속 낭독 보너스`, "streak_bonus");
      }
      setSubmitting(false);
    }, SUBMIT_DELAY_MS);
  };

  if (variant === "compact") {
    return (
      <div
        className="flex items-center gap-3 border-[1.5px] border-[var(--color-ink)] p-[13px]"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <div
          className="flex h-[42px] w-[42px] flex-none items-center justify-center border-[1.5px] border-[var(--color-accent)] bg-[var(--color-paper)]"
          style={{ borderRadius: "10px" }}
        >
          <ClockIcon size={20} />
        </div>
        <div className="flex-1">
          <span className="mb-[3px] block text-[9.5px] font-extrabold uppercase tracking-[.05em] text-[var(--color-accent)]">
            Today
          </span>
          <h3 className="text-[13.5px] font-semibold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
            데일리 5분 읽기
          </h3>
        </div>
        {dailyChallengeDone ? (
          <span className="text-xs font-bold text-[var(--color-ink-soft)]">완료</span>
        ) : (
          <button
            type="button"
            onClick={handleStart}
            disabled={submitting}
            className="flex items-center gap-1 bg-[var(--color-accent)] px-3.5 py-2 text-xs font-extrabold text-white disabled:opacity-70"
            style={{ borderRadius: "var(--radius-btn)" }}
          >
            {submitting && <Loader2 size={13} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
            {submitting ? "처리중" : "+10"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="mt-5 bg-[var(--color-accent-tint)] p-[22px]"
      style={{ borderRadius: "14px", border: "2px solid var(--color-accent)" }}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 flex-none items-center justify-center border-[1.5px] border-[var(--color-accent)] bg-[var(--color-paper)]"
          style={{ borderRadius: "16px" }}
        >
          <ClockIcon size={28} />
        </div>
        <div className="flex-1">
          <span className="mb-[3px] block text-[9.5px] font-extrabold uppercase tracking-[.05em] text-[var(--color-accent)]">
            Today
          </span>
          <h3 className="text-lg font-semibold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
            데일리 5분 읽기
          </h3>
          <p className="text-xs text-[var(--color-ink-soft)]">완료하면 마일리지 지급</p>
        </div>
      </div>
      {dailyChallengeDone ? (
        <div className="mt-4 text-center">
          <p className="text-[15px] font-bold text-[var(--color-accent)]">오늘의 챌린지를 완료했어요</p>
          <p className="mt-1 text-[11px] font-semibold text-[var(--color-ink-soft)]">
            내일 오전 6시에 초기화 · <span className="font-mono">{resetCountdown}</span> 남음
          </p>
          <p className="mt-2.5 select-none text-[11.5px] text-[var(--color-ink-soft)] blur-[3px]" aria-hidden="true">
            내일의 챌린지: {TOMORROW_PREVIEW}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleStart}
          disabled={submitting}
          className="mt-4 flex w-full items-center justify-center gap-2 bg-[var(--color-accent)] py-3.5 text-[15px] font-extrabold text-white disabled:opacity-70"
          style={{ borderRadius: "var(--radius-btn)" }}
        >
          {submitting && <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
          {submitting ? "처리중..." : "시작하기 →"}
        </button>
      )}
    </div>
  );
}
