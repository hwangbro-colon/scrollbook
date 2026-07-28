import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

const STEP_MS = 16;

// Animates the displayed number tweening from its previous value to `target`
// whenever `target` changes (e.g. mileage or scroll progress). Skips the
// tween entirely under prefers-reduced-motion. Uses setInterval rather than
// requestAnimationFrame — rAF gets paused/starved in backgrounded or
// automation-driven tabs, which would otherwise leave the tween stuck.
export function useCountUp(target: number, durationMs = 350) {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(target);
      fromRef.current = target;
      return;
    }
    const from = fromRef.current;
    if (from === target) return;

    const start = Date.now();
    const interval = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / durationMs);
      const eased = 1 - (1 - t) * (1 - t); // ease-out
      setDisplay(Math.round(from + (target - from) * eased));
      if (t >= 1) {
        fromRef.current = target;
        clearInterval(interval);
      }
    }, STEP_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs, reducedMotion]);

  return display;
}
