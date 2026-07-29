import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Medication } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { formatTime } from '../utils/formatters';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  medication: Medication;
  onPress: () => void;
  onDelete?: () => void;
}

export function MedicationListItem({ medication, onPress, onDelete }: Props) {
  const daysLabel =
    medication.daysOfWeek.length === 0
      ? 'Every day'
      : medication.daysOfWeek.map((d) => DAY_LABELS[d]).join(', ');

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.left}>
        <View style={styles.header}>
          <Text style={styles.name}>{medication.name}</Text>
          <View style={[styles.badge, medication.enabled ? styles.badgeOn : styles.badgeOff]}>
            <Text style={styles.badgeText}>{medication.enabled ? 'ON' : 'OFF'}</Text>
          </View>
        </View>
        <Text style={styles.detail}>
          {medication.dosage}  •  {formatTime(medication.time)}
        </Text>
        <Text style={styles.days}>{daysLabel}</Text>
      </View>
      {onDelete && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={22} color={Colors.danger} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  left: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  name: {
    ...Typography.bodyBold,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  badgeOn: {
    backgroundColor: Colors.success,
  },
  badgeOff: {
    backgroundColor: Colors.textTertiary,
  },
  badgeText: {
    color: Colors.textOnPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  detail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  days: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  deleteBtn: {
    padding: Spacing.sm,
  },
  deleteText: {
    fontSize: 20,
  },
});
