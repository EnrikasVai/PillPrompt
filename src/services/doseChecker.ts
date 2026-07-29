import dayjs from 'dayjs';
import { Medication, DoseLogEntry, AppSettings } from '../types';

/**
 * Pure function: returns all medications whose grace period has elapsed
 * and no 'taken' or 'missed' log exists for today's scheduled dose.
 */
export function detectMissedDoses(
  medications: Medication[],
  doseLog: DoseLogEntry[],
  settings: AppSettings,
  now: Date = new Date(),
): Medication[] {
  const missedMeds: Medication[] = [];
  const todayStr = dayjs(now).format('YYYY-MM-DD');
  const today = now.getDay(); // 0–6

  for (const med of medications) {
    if (!med.enabled) continue;

    // Check if today is a scheduled day for this medication
    if (med.daysOfWeek.length > 0 && !med.daysOfWeek.includes(today)) continue;

    // Calculate grace end time
    const [h, m] = med.time.split(':').map(Number);
    const scheduled = dayjs(`${todayStr}T${med.time}`);
    const graceEnd = scheduled.add(settings.gracePeriodMinutes, 'minute');

    // If grace period hasn't ended yet, skip
    if (dayjs(now).isBefore(graceEnd)) continue;

    // Check if already logged as taken or missed for this dose
    const alreadyLogged = doseLog.find(
      (log) =>
        log.medicationId === med.id &&
        log.scheduledDate === todayStr &&
        log.scheduledTime === med.time &&
        (log.status === 'taken' || log.status === 'missed'),
    );
    if (alreadyLogged) continue;

    missedMeds.push(med);
  }

  return missedMeds;
}
