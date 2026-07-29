import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const { state, updateSettings } = useApp();
  const { settings } = state;

  const [caregiverPhone, setCaregiverPhone] = useState(settings.caregiverPhone);
  const [gracePeriod, setGracePeriod] = useState(String(settings.gracePeriodMinutes));
  const [seniorName, setSeniorName] = useState(settings.seniorName);

  const handleSave = () => {
    const gp = parseInt(gracePeriod, 10);
    if (isNaN(gp) || gp < 1 || gp > 60) {
      Alert.alert('Error', 'Grace period must be between 1 and 60 minutes.');
      return;
    }
    updateSettings({
      caregiverPhone: caregiverPhone.trim(),
      gracePeriodMinutes: gp,
      seniorName: seniorName.trim(),
    });
    Alert.alert('Saved', 'Settings updated.');
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Caregiver Phone</Text>
      <TextInput
        style={styles.input}
        value={caregiverPhone}
        onChangeText={setCaregiverPhone}
        placeholder="+15551234567"
        placeholderTextColor={Colors.textTertiary}
        keyboardType="phone-pad"
      />
      <Text style={styles.hint}>Include country code (e.g. +1 for US)</Text>

      <Text style={styles.label}>Grace Period (minutes)</Text>
      <TextInput
        style={styles.input}
        value={gracePeriod}
        onChangeText={setGracePeriod}
        placeholder="15"
        placeholderTextColor={Colors.textTertiary}
        keyboardType="number-pad"
        maxLength={2}
      />
      <Text style={styles.hint}>How long after the scheduled time before alerting (1–60)</Text>

      <Text style={styles.label}>Senior Name</Text>
      <TextInput
        style={styles.input}
        value={seniorName}
        onChangeText={setSeniorName}
        placeholder="Mom"
        placeholderTextColor={Colors.textTertiary}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.7}>
        <Ionicons name="save-outline" size={20} color={Colors.textOnPrimary} />
        <Text style={styles.saveText}> Save</Text>
      </TouchableOpacity>
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
  hint: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
    marginBottom: 4,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    ...Shadows.card,
  },
  saveText: {
    ...Typography.button,
    fontSize: 18,
  },
});
