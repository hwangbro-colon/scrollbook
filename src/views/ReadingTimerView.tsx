import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Play, Pause, RotateCcw } from "lucide-react";
import { useMileageStore } from "../store/mileageStore";
import { useToastStore } from "../store/toastStore";
import { ScreenScroll } from "../components/common/ScreenScroll";

const MILEAGE_EVERY_SEC = 300; // +5 마일리지 per 5 focused minutes
const MILEAGE_AMOUNT = 5;

function formatTime(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// 타이머: a plain focus stopwatch. Mileage trickles in every 5 minutes
// rather than only on stop, so leaving it running has a visible payoff —
// consistent with how the rest of the app rewards time spent, not just
// task completion.
export function ReadingTimerView() {
  const navigate = useNavigate();
  const earnMileage = useMileageStore((s) => s.earnMileage);
  const showToast = useToastStore((s) => s.show);

  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rewardedSecondsRef = useRef(0);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const toggle = () => {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setRunning(false);
      return;
    }
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        const next = s + 1;
        if (next - rewardedSecondsRef.current >= MILEAGE_EVERY_SEC) {
          rewardedSecondsRef.current = next;
          earnMileage(MILEAGE_AMOUNT, "집중 읽기 5분", "timer");
        }
        return next;
      });
    }, 1000);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    if (seconds > 0) showToast(`${formatTime(seconds)} 동안 집중해서 읽었어요`);
    setSeconds(0);
    rewardedSecondsRef.current = 0;
  };

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
        타이머
      </div>
      <p className="mb-6 mt-0.5 text-xs text-[var(--color-ink-soft)]">5분마다 마일리지 +{MILEAGE_AMOUNT}가 쌓여요</p>

      <div className="flex flex-col items-center gap-6 border-[1.5px] border-[var(--color-ink)] py-10" style={{ borderRadius: "var(--radius-card)" }}>
        <p className="font-mono text-[44px] font-bold tabular-nums text-[var(--color-ink)]">{formatTime(seconds)}</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={reset}
            disabled={seconds === 0 && !running}
            aria-label="초기화"
            className="flex h-11 w-11 items-center justify-center border-[1.5px] border-[var(--color-ink)] disabled:opacity-30"
            style={{ borderRadius: "var(--radius-avatar)" }}
          >
            <RotateCcw size={17} strokeWidth={1.8} color="var(--color-ink)" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={toggle}
            aria-label={running ? "일시정지" : "시작"}
            className="flex h-16 w-16 items-center justify-center bg-[var(--color-accent)] text-white"
            style={{ borderRadius: "18px" }}
          >
            {running ? <Pause size={24} fill="white" aria-hidden="true" /> : <Play size={24} fill="white" aria-hidden="true" />}
          </button>
          <div className="h-11 w-11" />
        </div>
      </div>
    </ScreenScroll>
  );
}
