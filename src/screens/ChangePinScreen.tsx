import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ChangePin'>;

export function ChangePinScreen({ navigation }: Props) {
  const { state, updateSettings } = useApp();

  const [current, setCurrent] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleChange = () => {
    if (current !== state.settings.pinCode) {
      Alert.alert('Error', 'Current PIN is incorrect.');
      return;
    }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      Alert.alert('Error', 'New PIN must be exactly 4 digits.');
      return;
    }
    if (newPin !== confirm) {
      Alert.alert('Error', 'New PINs do not match.');
      return;
    }
    updateSettings({ pinCode: newPin });
    Alert.alert('Success', 'PIN changed successfully.');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Current PIN</Text>
      <TextInput
        style={styles.input}
        value={current}
        onChangeText={setCurrent}
        keyboardType="number-pad"
        maxLength={4}
        secureTextEntry
        placeholder="••••"
        placeholderTextColor={Colors.textTertiary}
      />

      <Text style={styles.label}>New PIN</Text>
      <TextInput
        style={styles.input}
        value={newPin}
        onChangeText={setNewPin}
        keyboardType="number-pad"
        maxLength={4}
        secureTextEntry
        placeholder="••••"
        placeholderTextColor={Colors.textTertiary}
      />

      <Text style={styles.label}>Confirm New PIN</Text>
      <TextInput
        style={styles.input}
        value={confirm}
        onChangeText={setConfirm}
        keyboardType="number-pad"
        maxLength={4}
        secureTextEntry
        placeholder="••••"
        placeholderTextColor={Colors.textTertiary}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleChange} activeOpacity={0.7}>
        <Text style={styles.saveText}>Change PIN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.md,
    justifyContent: 'center',
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
    padding: 14,
    fontSize: 20,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
    textAlign: 'center',
    letterSpacing: 8,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.xl,
    ...Shadows.card,
  },
  saveText: {
    ...Typography.button,
    fontSize: 18,
  },
});
