import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { useCountdown } from '../hooks/useCountdown';

interface Props {
  targetDate: Date | null;
}

export function CountdownTimer({ targetDate }: Props) {
  const { display, remainingMs } = useCountdown(targetDate);
  const isUrgent = remainingMs < 60_000 && remainingMs > 0;
  const isExpired = remainingMs <= 0;

  if (!targetDate) return null;

  return (
    <View style={[styles.container, isUrgent && styles.urgentContainer]}>
      <Text style={styles.label}>Grace window</Text>
      <Text
        style={[
          styles.timer,
          isUrgent && styles.urgent,
          isExpired && styles.expired,
        ]}
      >
        {display}
      </Text>
      <View style={styles.barContainer}>
        <View
          style={[
            styles.bar,
            { width: `${Math.min(100, (remainingMs / (15 * 60_000)) * 100)}%` },
            isUrgent && styles.barUrgent,
            isExpired && styles.barExpired,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
    ...Shadows.card,
  },
  urgentContainer: {
    backgroundColor: Colors.warning + '15',
    borderWidth: 2,
    borderColor: Colors.warning,
  },
  label: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  timer: {
    ...Typography.timer,
    color: Colors.primary,
    marginBottom: 12,
  },
  urgent: {
    color: Colors.warning,
  },
  expired: {
    color: Colors.danger,
  },
  barContainer: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  barUrgent: {
    backgroundColor: Colors.warning,
  },
  barExpired: {
    backgroundColor: Colors.danger,
    width: '100%',
  },
});
