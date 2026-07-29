import { useState, useEffect } from 'react';

/**
 * A countdown timer that ticks every second until reaching zero.
 * Returns the remaining milliseconds and a formatted MM:SS string.
 */
export function useCountdown(targetDate: Date | null): { remainingMs: number; display: string; isExpired: boolean } {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!targetDate) {
      setRemainingMs(0);
      return;
    }

    const tick = () => {
      const remaining = targetDate.getTime() - Date.now();
      setRemainingMs(Math.max(0, remaining));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return { remainingMs, display, isExpired: remainingMs <= 0 };
}
