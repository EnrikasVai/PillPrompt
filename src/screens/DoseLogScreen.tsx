import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, DoseLogEntry } from '../types';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { formatTime } from '../utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'DoseLog'>;

interface GroupedLog {
  date: string;
  entries: (DoseLogEntry & { medicationName: string })[];
}

export function DoseLogScreen({ navigation }: Props) {
  const { state, clearDoseLog } = useApp();

  const grouped = useMemo(() => {
    const map = new Map<string, (DoseLogEntry & { medicationName: string })[]>();
    const sorted = [...state.doseLog].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    for (const entry of sorted) {
      const med = state.medications.find((m) => m.id === entry.medicationId);
      const enriched = { ...entry, medicationName: med?.name ?? 'Unknown' };
      const existing = map.get(entry.scheduledDate) ?? [];
      existing.push(enriched);
      map.set(entry.scheduledDate, existing);
    }

    return Array.from(map.entries()).map(([date, entries]) => ({ date, entries }));
  }, [state.doseLog, state.medications]);

  const handleClear = () => {
    Alert.alert('Clear All Logs', 'This cannot be undone. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearDoseLog },
    ]);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'taken':
        return <Ionicons name="checkmark-circle" size={24} color={Colors.success} />;
      case 'missed':
        return <Ionicons name="close-circle" size={24} color={Colors.danger} />;
      case 'snoozed':
        return <Ionicons name="alarm-outline" size={24} color={Colors.warning} />;
      default:
        return <Ionicons name="help-circle-outline" size={24} color={Colors.textTertiary} />;
    }
  };

  if (state.doseLog.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No dose history yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={grouped}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <View>
            <Text style={styles.dateHeader}>{item.date}</Text>
            {item.entries.map((entry) => (
              <View key={entry.id} style={styles.entry}>
                <View style={styles.entryIcon}>{statusIcon(entry.status)}</View>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryName}>{entry.medicationName}</Text>
                  <Text style={styles.entryMeta}>
                    {formatTime(entry.scheduledTime)} — {entry.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      />
      <TouchableOpacity style={styles.clearButton} onPress={handleClear} activeOpacity={0.7}>
        <Text style={styles.clearText}>Clear All Logs</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textTertiary,
  },
  dateHeader: {
    ...Typography.bodyBold,
    color: Colors.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: 6,
    ...Shadows.card,
  },
  entryIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    ...Typography.bodyBold,
  },
  entryMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  clearButton: {
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  clearText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },
});
