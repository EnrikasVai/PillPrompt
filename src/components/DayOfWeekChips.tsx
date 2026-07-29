import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../theme';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  selected: number[];
  onChange: (days: number[]) => void;
}

export function DayOfWeekChips({ selected, onChange }: Props) {
  const toggle = (day: number) => {
    if (selected.includes(day)) {
      onChange(selected.filter((d) => d !== day));
    } else {
      onChange([...selected, day]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Repeat on:</Text>
      <View style={styles.row}>
        {DAY_LABELS.map((label, i) => {
          const isSelected = selected.includes(i);
          return (
            <TouchableOpacity
              key={i}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => toggle(i)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.hint}>
        {selected.length === 0 ? 'Nothing selected = Every day' : ' '}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextSelected: {
    color: Colors.textOnPrimary,
  },
  hint: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
