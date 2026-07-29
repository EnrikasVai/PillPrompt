import { useState, useEffect } from 'react';
import { Medication, AppSettings, UpcomingDose } from '../types';
import { parseTimeToToday } from '../utils/formatters';

/**
 * Given the list of medications and app settings, compute the next upcoming dose.
 * Returns null if there are no more doses scheduled for today.
 */
export function useUpcomingDose(medications: Medication[], settings: AppSettings): UpcomingDose | null {
  const [upcoming, setUpcoming] = useState<UpcomingDose | null>(null);

  useEffect(() => {
    // Recalculate every 30 seconds
    const calc = () => {
      const now = new Date();
      const today = now.getDay();

      let best: UpcomingDose | null = null;

      for (const med of medications) {
        if (!med.enabled) continue;
        if (med.daysOfWeek.length > 0 && !med.daysOfWeek.includes(today)) continue;

        const scheduled = parseTimeToToday(med.time);
        const graceEnd = new Date(scheduled.getTime() + settings.gracePeriodMinutes * 60_000);

        // Skip if already past the grace period (handled by missed-dose detection)
        if (now > graceEnd) continue;

        // Pick the earliest upcoming
        if (!best || scheduled < best.scheduledDateTime) {
          let status: UpcomingDose['status'];
          if (now < scheduled) {
            status = 'upcoming';
          } else if (now >= scheduled && now <= graceEnd) {
            status = 'in-grace';
          } else {
            status = 'missed';
          }

          best = {
            medication: med,
            scheduledDateTime: scheduled,
            graceEndDateTime: graceEnd,
            status,
          };
        }
      }

      setUpcoming(best);
    };

    calc();
    const interval = setInterval(calc, 30_000);
    return () => clearInterval(interval);
  }, [medications, settings]);

  return upcoming;
}
