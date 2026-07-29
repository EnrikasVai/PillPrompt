import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout } from '../theme';

interface Props {
  onPress: () => void;
  disabled?: boolean;
}

export function TakenButton({ onPress, disabled }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.button, disabled && styles.disabled]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={disabled}
        accessibilityLabel="I took it"
        accessibilityRole="button"
      >
        <Ionicons name="medkit-outline" size={36} color={Colors.textOnPrimary} />
        <Text style={styles.text}>I TOOK IT</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.button,
  },
  button: {
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.xl,
    paddingVertical: 30,
    paddingHorizontal: 50,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Layout.buttonMinHeight + 40,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  disabled: {
    backgroundColor: Colors.textTertiary,
    borderColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  icon: {
    marginBottom: 8,
  },
  text: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.textOnPrimary,
    letterSpacing: 3,
  },
});
