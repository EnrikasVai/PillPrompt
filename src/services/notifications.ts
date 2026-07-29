import * as Notifications from 'expo-notifications';
import { Medication } from '../types';

/**
 * Cancel all scheduled notifications and re-schedule based on current medications.
 * Call this on app launch and whenever medications/settings change.
 */
export async function rescheduleAllNotifications(medications: Medication[]): Promise<void> {
  // Cancel existing
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Request permissions
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  // Schedule one per medication per active day
  for (const med of medications) {
    if (!med.enabled) continue;

    const [hours, minutes] = med.time.split(':').map(Number);

    const days = med.daysOfWeek.length === 0
      ? [0, 1, 2, 3, 4, 5, 6]  // Every day
      : med.daysOfWeek;

    for (const day of days) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Time for ${med.name}`,
          body: `${med.dosage} — tap to open PillPrompt`,
          data: { medicationId: med.id },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: day + 1,          // expo uses 1–7 where 1=Sunday
          hour: hours,
          minute: minutes,
        },
      });
    }
  }
}

/** Set up notification handler for when app is in foreground */
export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}
