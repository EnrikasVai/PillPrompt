import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';
import { Ionicons } from '@expo/vector-icons';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_ABBREV = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface Props {
  selected: number[];
  onChange: (days: number[]) => void;
}

export function DayOfWeekChips({ selected, onChange }: Props) {
  const [visible, setVisible] = useState(false);

  const toggle = (day: number) => {
    if (selected.includes(day)) {
      onChange(selected.filter((d) => d !== day));
    } else {
      onChange([...selected, day].sort((a, b) => a - b));
    }
  };

  return (
    <>
      <Text style={styles.label}>Repeat on</Text>
      <TouchableOpacity style={styles.trigger} onPress={() => setVisible(true)} activeOpacity={0.7}>
        <Ionicons name="repeat-outline" size={20} color={Colors.primary} />
        <View style={styles.badges}>
          {selected.length === 0 ? (
            <Text style={styles.triggerText}>Every day</Text>
          ) : (
            DAY_ABBREV.map((abbr, i) => {
              const on = selected.includes(i);
              return (
                <View key={i} style={[styles.badge, on && styles.badgeOn]}>
                  <Text style={[styles.badgeText, on && styles.badgeTextOn]}>{abbr}</Text>
                </View>
              );
            })
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={() => setVisible(false)} />
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Repeat On</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.confirmText}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={DAY_LABELS}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item, index }) => {
                const isSelected = selected.includes(index);
                return (
                  <TouchableOpacity
                    style={styles.checkRow}
                    onPress={() => toggle(index)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.checkLabel}>{item}</Text>
                    <View style={[styles.checkbox, isSelected && styles.checkboxOn]}>
                      {isSelected && <Ionicons name="checkmark" size={18} color={Colors.textOnPrimary} />}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: Spacing.md,
  },
  badges: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeOn: {
    backgroundColor: Colors.primary,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  badgeTextOn: {
    color: Colors.textOnPrimary,
  },
  triggerText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  modal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: 40,
    ...Shadows.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.textTertiary,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  checkLabel: {
    fontSize: 17,
    color: Colors.textPrimary,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxOn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
});
