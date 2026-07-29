import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../theme';

interface Props {
  onPress: (digit: string) => void;
  onDelete: () => void;
}

const DIGITS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
];

export function NumericKeypad({ onPress, onDelete }: Props) {
  return (
    <View style={styles.container}>
      {DIGITS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((digit) => (
            <TouchableOpacity
              key={digit || `empty-${ri}`}
              style={[styles.key, !digit && styles.keyEmpty]}
              onPress={() => {
                if (digit === '⌫') onDelete();
                else if (digit) onPress(digit);
              }}
              activeOpacity={0.6}
              disabled={!digit}
              accessibilityLabel={digit === '⌫' ? 'Delete' : digit || 'empty'}
            >
              <Text style={styles.keyText}>{digit}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  key: {
    width: 80,
    height: 60,
    marginHorizontal: 8,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyEmpty: {
    backgroundColor: 'transparent',
  },
  keyText: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
