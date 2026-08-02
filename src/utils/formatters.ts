import dayjs from 'dayjs';

/**
 * Convert JS Date.getDay() (0=Sunday ... 6=Saturday)
 * to the app's day-of-week index (0=Monday ... 6=Sunday).
 */
export function jsDayToAppDay(jsDay: number): number {
  return (jsDay + 6) % 7;
}

/** Format a "HH:mm" string to 24-hour display like "08:00" */
export function formatTime(time24: string): string {
  return time24;
}

/** Format a Date to "YYYY-MM-DD" */
export function formatDate(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD');
}

/** Parse "HH:mm" into today's Date */
export function parseTimeToToday(time24: string): Date {
  const [h, m] = time24.split(':').map(Number);
  return dayjs().hour(h).minute(m).second(0).millisecond(0).toDate();
}

/** Return a human-friendly label for how long ago something happened */
export function timeAgo(isoString: string): string {
  const now = dayjs();
  const then = dayjs(isoString);
  const mins = now.diff(then, 'minute');
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = now.diff(then, 'hour');
  if (hours < 24) return `${hours}h ago`;
  return then.format('MMM D, HH:mm');
}
