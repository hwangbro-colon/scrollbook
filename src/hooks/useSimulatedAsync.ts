import { useEffect, useState } from "react";

export type AsyncStatus = "loading" | "error" | "success";

// Simulates fetching a section's data with a short artificial delay, since
// this prototype has no real backend. Pass `failFirstAttempt` to always
// surface the error-card + retry path once (useful for demoing it) — every
// later retry succeeds.
export function useSimulatedAsync({
  delayMs = 700,
  failFirstAttempt = false,
}: {
  delayMs?: number;
  failFirstAttempt?: boolean;
} = {}) {
  const [status, setStatus] = useState<AsyncStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setStatus("loading");
    const timer = setTimeout(() => {
      setStatus(failFirstAttempt && attempt === 0 ? "error" : "success");
    }, delayMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const retry = () => setAttempt((a) => a + 1);

  return { status, retry };
}
