import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { Ionicons } from '@expo/vector-icons';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const LIST_PADDING = (VISIBLE_ITEMS - 1) * ITEM_HEIGHT / 2;

interface Props {
  hours: string;
  minutes: string;
  onHoursChange: (h: string) => void;
  onMinutesChange: (m: string) => void;
}

const hoursData = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const minutesData = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

function WheelColumn({
  data,
  value,
  onChange,
}: {
  data: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const flatRef = useRef<FlatList>(null);

  const handleMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const index = Math.round(y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(data.length - 1, index));
      onChange(data[clamped]);
    },
    [data, onChange],
  );

  const renderItem = useCallback(
    ({ item }: { item: string }) => {
      const isSelected = item === value;
      return (
        <View style={styles.item}>
          <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
            {item}
          </Text>
        </View>
      );
    },
    [value],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const keyExtractor = useCallback((item: string) => item, []);

  const initialIndex = data.indexOf(value);

  return (
    <View style={styles.column}>
      <View style={styles.centerHighlight} pointerEvents="none" />
      <FlatList
        ref={flatRef}
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: LIST_PADDING }}
        initialScrollIndex={initialIndex >= 0 ? initialIndex : 0}
        onMomentumScrollEnd={handleMomentumEnd}
      />
    </View>
  );
}

export function TimeWheelPicker({ hours, minutes, onHoursChange, onMinutesChange }: Props) {
  const [visible, setVisible] = useState(false);
  const [draftHours, setDraftHours] = useState(hours);
  const [draftMinutes, setDraftMinutes] = useState(minutes);

  const open = () => {
    setDraftHours(hours);
    setDraftMinutes(minutes);
    setVisible(true);
  };

  const confirm = () => {
    onHoursChange(draftHours);
    onMinutesChange(draftMinutes);
    setVisible(false);
  };

  const dismiss = () => {
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={open} activeOpacity={0.7}>
        <Ionicons name="time-outline" size={20} color={Colors.primary} />
        <Text style={styles.triggerText}>
          {hours}:{minutes}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={dismiss}
      >
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={dismiss} />
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={dismiss}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity onPress={confirm}>
                <Text style={styles.confirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.wheels}>
              <WheelColumn data={hoursData} value={draftHours} onChange={setDraftHours} />
              <Text style={styles.separator}>:</Text>
              <WheelColumn data={minutesData} value={draftMinutes} onChange={setDraftMinutes} />
            </View>
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
  triggerText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
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
  wheels: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  column: {
    width: 80,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    position: 'relative',
  },
  centerHighlight: {
    position: 'absolute',
    top: LIST_PADDING,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: Colors.primaryPale,
    borderRadius: BorderRadius.sm,
    zIndex: 0,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 22,
    fontWeight: '500',
    color: Colors.textTertiary,
  },
  itemTextSelected: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  separator: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginHorizontal: 4,
  },
});
