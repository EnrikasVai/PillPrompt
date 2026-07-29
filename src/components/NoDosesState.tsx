import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

export function NoDosesState() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="moon-outline" size={56} color={Colors.primary} />
        <Text style={styles.title}>All Done for Today!</Text>
        <Text style={styles.subtitle}>
          {"You're all caught up.\nGreat job staying healthy!"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.primaryPale,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.primary + '20',
    ...Shadows.card,
  },
  title: {
    ...Typography.h2,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 26,
    color: Colors.primaryDark,
  },
});
