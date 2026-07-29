import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { PinDots } from '../components/PinDots';
import { NumericKeypad } from '../components/NumericKeypad';

type Props = NativeStackScreenProps<RootStackParamList, 'PinGate'>;

export function PinGateScreen({ navigation }: Props) {
  const { state } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = useCallback(
    (digit: string) => {
      const next = pin + digit;
      setPin(next);
      setError(false);

      if (next.length === 4) {
        // Check PIN
        if (next === state.settings.pinCode) {
          setPin('');
          navigation.replace('CaregiverSetup');
        } else {
          setPin('');
          setError(true);
        }
      }
    },
    [pin, state.settings.pinCode, navigation],
  );

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter PIN</Text>
      <PinDots length={pin.length} />
      {error && <Text style={styles.error}>Incorrect PIN</Text>}
      <NumericKeypad onPress={handleDigit} onDelete={handleDelete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  error: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.danger,
    marginBottom: Spacing.md,
  },
});
