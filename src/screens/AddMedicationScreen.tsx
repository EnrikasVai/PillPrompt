import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Medication } from '../types';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { DayOfWeekChips } from '../components/DayOfWeekChips';
import { TimeWheelPicker } from '../components/TimeWheelPicker';

type Props = NativeStackScreenProps<RootStackParamList, 'AddMedication'>;

export function AddMedicationScreen({ navigation, route }: Props) {
  const { state, addMedication, updateMedication, deleteMedication } = useApp();
  const editId = route.params?.medicationId;
  const isEditing = !!editId;

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timeHours, setTimeHours] = useState('08');
  const [timeMinutes, setTimeMinutes] = useState('00');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [pillCount, setPillCount] = useState('');

  useEffect(() => {
    if (isEditing) {
      const med = state.medications.find((m) => m.id === editId);
      if (med) {
        setName(med.name);
        setDosage(med.dosage);
        const [h, m] = med.time.split(':');
        setTimeHours(h);
        setTimeMinutes(m);
        setDaysOfWeek(med.daysOfWeek);
        setEnabled(med.enabled);
        setPillCount(med.pillCount > 0 ? String(med.pillCount) : '');
      }
    }
  }, [editId, isEditing, state.medications]);

  const validate = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a medication name.');
      return false;
    }
    if (!dosage.trim()) {
      Alert.alert('Error', 'Please enter a dosage.');
      return false;
    }
    const h = parseInt(timeHours, 10);
    const m = parseInt(timeMinutes, 10);
    if (isNaN(h) || h < 0 || h > 23 || isNaN(m) || m < 0 || m > 59) {
      Alert.alert('Error', 'Please enter a valid time (00:00–23:59).');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;

    const count = parseInt(pillCount, 10);
    const initialCount = isNaN(count) || count < 1 ? 0 : count;

    const med: Medication = {
      id: editId || '',
      name: name.trim(),
      dosage: dosage.trim(),
      time: `${timeHours.padStart(2, '0')}:${timeMinutes.padStart(2, '0')}`,
      daysOfWeek,
      enabled,
      pillCount: initialCount,
      // Reset remaining to initial count when editing
      remainingPills: isEditing
        ? initialCount
        : initialCount,
    };

    if (isEditing) {
      updateMedication(med);
    } else {
      addMedication(med);
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!editId) return;
    Alert.alert('Delete Medication', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteMedication(editId);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Metformin"
        placeholderTextColor={Colors.textTertiary}
      />

      <Text style={styles.label}>Dosage</Text>
      <TextInput
        style={styles.input}
        value={dosage}
        onChangeText={setDosage}
        placeholder="e.g. 1 tablet – 500mg"
        placeholderTextColor={Colors.textTertiary}
      />

      <Text style={styles.label}>Time</Text>
      <TimeWheelPicker
        hours={timeHours}
        minutes={timeMinutes}
        onHoursChange={setTimeHours}
        onMinutesChange={setTimeMinutes}
      />

      <Text style={styles.label}>Pill count (for refill tracking)</Text>
      <TextInput
        style={styles.input}
        value={pillCount}
        onChangeText={setPillCount}
        keyboardType="number-pad"
        maxLength={5}
        placeholder="e.g. 30 — leave empty to skip"
        placeholderTextColor={Colors.textTertiary}
      />
      {pillCount.trim() !== '' && (
        <Text style={styles.hint}>
          Remaining pills will decrease each time you tap "I TOOK IT".
          A notification will remind you when {5} or fewer are left.
        </Text>
      )}

      <DayOfWeekChips selected={daysOfWeek} onChange={setDaysOfWeek} />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Enabled</Text>
        <Switch value={enabled} onValueChange={setEnabled} trackColor={{ true: Colors.primary }} />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.7}>
        <Ionicons name="save-outline" size={20} color={Colors.textOnPrimary} />
        <Text style={styles.saveText}> Save</Text>
      </TouchableOpacity>

      {isEditing && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={20} color={Colors.textOnPrimary} />
          <Text style={styles.deleteText}> Delete Medication</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.md,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  hint: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    ...Shadows.card,
  },
  saveText: {
    ...Typography.button,
    fontSize: 18,
  },
  deleteButton: {
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },
});
