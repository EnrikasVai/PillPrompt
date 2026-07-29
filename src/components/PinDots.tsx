import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../theme';

interface Props {
  length: number;
  maxLength?: number;
}

export function PinDots({ length, maxLength = 4 }: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: maxLength }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i < length ? styles.dotFilled : styles.dotEmpty]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 32,
    gap: 16,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  dotFilled: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  dotEmpty: {
    backgroundColor: 'transparent',
    borderColor: Colors.textTertiary,
  },
});
