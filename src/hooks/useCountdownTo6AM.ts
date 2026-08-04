import { useEffect, useState } from "react";

function msUntilNextSixAM() {
  const now = new Date();
  const target = new Date(now);
  target.setHours(6, 0, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  return target.getTime() - now.getTime();
}

// Countdown string (HH:MM:SS) to the next 06:00 — when the daily challenge
// resets. Only ticks while `active` so idle screens don't run a hidden timer.
export function useCountdownTo6AM(active: boolean) {
  const [remainingMs, setRemainingMs] = useState(msUntilNextSixAM);

  useEffect(() => {
    if (!active) return;
    setRemainingMs(msUntilNextSixAM());
    const id = setInterval(() => setRemainingMs(msUntilNextSixAM()), 1000);
    return () => clearInterval(id);
  }, [active]);

  const h = Math.floor(remainingMs / 3600000);
  const m = Math.floor((remainingMs % 3600000) / 60000);
  const s = Math.floor((remainingMs % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
