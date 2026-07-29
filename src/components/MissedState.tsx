import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

interface Props {
  medicationName: string;
  caregiverPhone?: string;
}

export function MissedState({ medicationName, caregiverPhone }: Props) {
  const handleCall = () => {
    if (!caregiverPhone) return;
    const url = `tel:${caregiverPhone}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Phone calls not supported on this device.');
      }
    });
  };

  return (
    <View style={styles.outer}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="alert" size={42} color={Colors.textOnDanger} />
        </View>
        <Text style={styles.title}>Missed Dose</Text>
        <Text style={styles.medication}>{medicationName}</Text>
        <View style={styles.divider} />
        <Text style={styles.alertText}>
          Don't worry — just take it as{'\n'}soon as you remember.
        </Text>

        {caregiverPhone && (
          <TouchableOpacity style={styles.callBtn} onPress={handleCall} activeOpacity={0.7}>
            <Ionicons name="call-outline" size={20} color={Colors.textOnDanger} />
            <Text style={styles.callBtnText}> Call Caregiver</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.card,
  },
  card: {
    backgroundColor: Colors.dangerLight,
    borderWidth: 2,
    borderColor: Colors.danger,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  icon: {
    color: Colors.textOnDanger,
  },
  title: {
    ...Typography.h1,
    color: Colors.danger,
    marginBottom: Spacing.sm,
  },
  medication: {
    ...Typography.h2,
    color: Colors.danger,
    marginBottom: Spacing.md,
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: Colors.danger + '40',
    borderRadius: 2,
    marginBottom: Spacing.md,
  },
  alertText: {
    ...Typography.body,
    color: Colors.danger,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    width: '100%',
  },
  callBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textOnDanger,
  },
});
