import { Linking, Alert, Platform } from 'react-native';
import { Medication, AppSettings } from '../types';

/**
 * Open the native SMS app with a pre-filled missed-dose alert message.
 * - Android: pre-fills both recipient and message.
 * - iOS: opens Messages with the body pre-filled. A prompt shows the
 *   caregiver's number so they can enter it in the "To" field manually.
 */
export async function sendMissedDoseAlert(
  medication: Medication,
  settings: AppSettings,
): Promise<void> {
  const message =
    `ALERT: ${settings.seniorName} hasn't confirmed taking ${medication.name} (${medication.dosage}) at ${medication.time}. ` +
    `Please check in.`;

  const encoded = encodeURIComponent(message);
  const url = Platform.select({
    ios: `sms:&body=${encoded}`,
    android: `sms:${settings.caregiverPhone}?body=${encoded}`,
  });

  if (!url) return;

  // iOS can't pre-fill the recipient — show instructions first
  if (Platform.OS === 'ios') {
    Alert.alert(
      'Send Alert to Caregiver',
      `Open Messages and send to:\n${settings.caregiverPhone}\n\n` +
        'Tap the "To" field, paste the number above, then tap Send.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Messages',
          onPress: () => Linking.openURL(url).catch(() => {}),
        },
      ],
    );
    return;
  }

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        'SMS Not Supported',
        'Cannot open SMS app. Please check the caregiver phone number.',
      );
    }
  } catch {
    Alert.alert('Error', 'Failed to open SMS app.');
  }
}
