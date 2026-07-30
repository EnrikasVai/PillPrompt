import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Medication } from '../types';

const LOW_STOCK_THRESHOLD = 5;

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

/**
 * Check medications for low stock and send a notification if any are running low.
 * Call this AFTER decrementing pill count (e.g. when a dose is taken).
 * Cancels any previous low-stock notifications first to avoid duplicates.
 */
export async function checkLowStockNotifications(medications: Medication[]): Promise<void> {
  const low = medications.filter(
    (m) => m.enabled && m.pillCount > 0 && m.remainingPills > 0 && m.remainingPills <= LOW_STOCK_THRESHOLD,
  );
  if (low.length === 0) return;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  // Cancel any previously scheduled low-stock notifications to prevent duplicates
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.content.data?.type === 'low-stock') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  for (const med of low) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Refill needed',
        body: `${med.name} — only ${med.remainingPills} ${med.remainingPills === 1 ? 'pill' : 'pills'} remaining!`,
        data: { medicationId: med.id, type: 'low-stock' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });
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
