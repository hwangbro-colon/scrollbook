import { useEffect, useState } from "react";
import { useToastStore } from "../../store/toastStore";

const VISIBLE_MS = 2000;
const EXIT_MS = 160;

export function Toast() {
  const front = useToastStore((s) => s.queue[0]);
  const dismissFront = useToastStore((s) => s.dismissFront);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!front) return;
    setExiting(false);
    const exitTimer = setTimeout(() => setExiting(true), VISIBLE_MS);
    const removeTimer = setTimeout(() => dismissFront(), VISIBLE_MS + EXIT_MS);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [front, dismissFront]);

  if (!front) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-20 z-50 flex justify-center px-6" role="status" aria-live="polite">
      <div
        key={front.id}
        className={`${exiting ? "animate-toast-out" : "animate-toast-in"} bg-[var(--color-ink)] px-4 py-2.5 text-sm font-medium text-white shadow-lg`}
        style={{ borderRadius: "var(--radius-btn)" }}
      >
        {front.message}
      </div>
    </div>
  );
}
