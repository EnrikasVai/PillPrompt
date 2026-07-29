import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

interface Props {
  seniorName: string;
}

export function TakenState({ seniorName }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={44} color={Colors.textOnPrimary} />
        </View>
        <Text style={styles.title}>All Done!</Text>
        <Text style={styles.subtitle}>
          See you later{seniorName ? `, ${seniorName}` : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.successLight,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: Colors.success + '30',
    ...Shadows.card,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  checkmark: {
    color: Colors.textOnPrimary,
  },
  title: {
    ...Typography.h1,
    color: Colors.success,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 26,
  },
});
