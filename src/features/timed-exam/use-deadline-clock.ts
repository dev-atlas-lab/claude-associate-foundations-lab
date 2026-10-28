import { useEffect, useState } from "react";

export const browserNow = (): number => Date.now();

/**
 * Re-render once per second while the attempt is active, always from the wall
 * clock. Browser timer throttling can delay a render, but it cannot move the
 * persisted deadline, so the remaining time never drifts upward.
 */
export function useDeadlineClock(
  deadlineAt: string | undefined,
  active: boolean,
  now: () => number = browserNow,
): number {
  const [nowMs, setNowMs] = useState(() => now());

  useEffect(() => {
    if (!active || deadlineAt === undefined) {
      return;
    }

    const tick = () => setNowMs(now());

    tick();
    const interval = window.setInterval(tick, 1000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        tick();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", tick);
    window.addEventListener("pageshow", tick);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", tick);
      window.removeEventListener("pageshow", tick);
    };
  }, [active, deadlineAt, now]);

  return nowMs;
}
