import dayjs from 'dayjs';
import { Medication, DoseLogEntry, AppSettings } from '../types';
import { jsDayToAppDay } from '../utils/formatters';

const RESOLVED_STATUSES: DoseLogEntry['status'][] = ['taken', 'missed', 'skipped'];

function isScheduledOn(med: Medication, appDay: number): boolean {
  return med.daysOfWeek.length === 0 || med.daysOfWeek.includes(appDay);
}

function isResolved(doseLog: DoseLogEntry[], medicationId: string, scheduledDate: string, scheduledTime: string): boolean {
  return doseLog.some(
    (log) =>
      log.medicationId === medicationId &&
      log.scheduledDate === scheduledDate &&
      log.scheduledTime === scheduledTime &&
      RESOLVED_STATUSES.includes(log.status),
  );
}

/**
 * Pure function: returns all medications whose grace period has elapsed
 * and no 'taken', 'missed', or 'skipped' log exists for today's scheduled dose.
 */
export function detectMissedDoses(
  medications: Medication[],
  doseLog: DoseLogEntry[],
  settings: AppSettings,
  now: Date = new Date(),
): Medication[] {
  const missedMeds: Medication[] = [];
  const todayStr = dayjs(now).format('YYYY-MM-DD');
  const appDay = jsDayToAppDay(now.getDay());

  for (const med of medications) {
    if (!med.enabled) continue;

    // Check if today is a scheduled day for this medication
    if (!isScheduledOn(med, appDay)) continue;

    // Calculate grace end time
    const scheduled = dayjs(`${todayStr}T${med.time}`);
    const graceEnd = scheduled.add(settings.gracePeriodMinutes, 'minute');

    // If grace period hasn't ended yet, skip
    if (dayjs(now).isBefore(graceEnd)) continue;

    // Check if already logged as taken, missed, or skipped for this dose
    if (isResolved(doseLog, med.id, todayStr, med.time)) continue;

    missedMeds.push(med);
  }

  return missedMeds;
}

/**
 * Pure function: backfill missed doses for past days between `fromDate` (exclusive)
 * and `toDate` (exclusive). Used when the app is reopened after being closed,
 * so missed doses from days the app wasn't open are still recorded.
 * `fromDate` should be the last date the app checked (inclusive), so the scan
 * starts the day after. `toDate` is usually today, so today is handled by
 * detectMissedDoses() separately.
 */
export function computeBackfillMisses(
  medications: Medication[],
  doseLog: DoseLogEntry[],
  fromDate: string, // YYYY-MM-DD (inclusive, scan starts next day)
  toDate: string,   // YYYY-MM-DD (exclusive — today is handled separately)
): Array<{ medicationId: string; scheduledDate: string; scheduledTime: string }> {
  const missed: Array<{ medicationId: string; scheduledDate: string; scheduledTime: string }> = [];

  const from = dayjs(fromDate);
  const to = dayjs(toDate);

  // Nothing to backfill if fromDate is after or equal to toDate
  if (!from.isBefore(to)) return missed;

  for (let d = from.add(1, 'day'); d.isBefore(to); d = d.add(1, 'day')) {
    const dateStr = d.format('YYYY-MM-DD');
    const appDay = jsDayToAppDay(d.day());

    for (const med of medications) {
      if (!med.enabled) continue;
      if (!isScheduledOn(med, appDay)) continue;
      if (isResolved(doseLog, med.id, dateStr, med.time)) continue;

      missed.push({ medicationId: med.id, scheduledDate: dateStr, scheduledTime: med.time });
    }
  }

  return missed;
}
