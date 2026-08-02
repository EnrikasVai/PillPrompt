import React, { useState } from 'react';
import dayjs from 'dayjs';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { saveLastCheckDate } from '../services/storage';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { PinDots } from '../components/PinDots';
import { NumericKeypad } from '../components/NumericKeypad';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const STEPS = ['welcome', 'phone', 'pin', 'grace'] as const;
type Step = (typeof STEPS)[number];

export function OnboardingScreen({ navigation }: Props) {
  const { updateSettings } = useApp();
  const [step, setStep] = useState<Step>('welcome');

  const [seniorName, setSeniorName] = useState('');
  const [caregiverPhone, setCaregiverPhone] = useState('');
  const [pinStage, setPinStage] = useState<'set' | 'confirm'>('set');
  const [pinValue, setPinValue] = useState('');
  const [pinConfirmValue, setPinConfirmValue] = useState('');
  const [gracePeriod, setGracePeriod] = useState('15');
  const [error, setError] = useState('');

  const currentIndex = STEPS.indexOf(step);

  const goNext = () => {
    setError('');

    if (step === 'welcome') {
      if (!seniorName.trim()) {
        setError('Please enter a name.');
        return;
      }
      setStep('phone');
      return;
    }

    if (step === 'phone') {
      setStep('pin');
      return;
    }

    if (step === 'pin') {
      // Handled by NumericKeypad auto-advance — nothing to do here
      return;
    }

    if (step === 'grace') {
      // No validation needed — stepper already constrains to 1-60
      updateSettings({
        seniorName: seniorName.trim(),
        caregiverPhone: caregiverPhone.trim(),
        pinCode: pinValue,
        gracePeriodMinutes: parseInt(gracePeriod, 10),
      });
      // Set baseline for missed-dose backfill — don't log doses from before account creation
      saveLastCheckDate(dayjs().format('YYYY-MM-DD'));
      navigation.replace('Home');
    }
  };

  const goBack = () => {
    setError('');
    const prev = STEPS[currentIndex - 1];
    if (!prev) return;

    // Reset PIN state when going back to it
    if (prev === 'pin') {
      setPinStage('set');
      setPinValue('');
      setPinConfirmValue('');
    }

    setStep(prev);
  };

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <View style={styles.stepContent}>
            <Ionicons name="happy-outline" size={56} color={Colors.primary} />
            <Text style={styles.title}>Welcome to PillPrompt!</Text>
            <Text style={styles.subtitle}>
              Let's set up your medication reminders. First, what should we call you?
            </Text>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={seniorName}
              onChangeText={setSeniorName}
              placeholder="e.g. Mom, Dad, John"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="default"
              autoFocus
              returnKeyType="next"
              onSubmitEditing={goNext}
            />
          </View>
        );

      case 'phone':
        return (
          <View style={styles.stepContent}>
            <Ionicons name="call-outline" size={56} color={Colors.primary} />
            <Text style={styles.title}>Caregiver's Phone</Text>
            <Text style={styles.subtitle}>
              Who should we alert if a dose is missed?{'\n'}
              Include country code (e.g. +1 for US).
            </Text>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={caregiverPhone}
              onChangeText={setCaregiverPhone}
              placeholder="+15551234567"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="phone-pad"
              autoFocus
            />
            <Text style={styles.hint}>You can skip this and add it later.</Text>
          </View>
        );

      case 'pin':
        const handlePinDigit = (digit: string) => {
          setError('');
          const current = pinStage === 'set' ? pinValue : pinConfirmValue;
          const next = current + digit;
          if (next.length > 4) return;

          if (pinStage === 'set') {
            setPinValue(next);
            if (next.length === 4) {
              setTimeout(() => setPinStage('confirm'), 300);
            }
          } else {
            setPinConfirmValue(next);
            if (next.length === 4) {
              setTimeout(() => {
                if (next === pinValue) {
                  setStep('grace');
                } else {
                  setError('PINs do not match. Try again.');
                  setPinConfirmValue('');
                }
              }, 300);
            }
          }
        };

        const handlePinDelete = () => {
          setError('');
          if (pinStage === 'set') {
            setPinValue((prev) => prev.slice(0, -1));
          } else {
            setPinConfirmValue((prev) => prev.slice(0, -1));
          }
        };

        const currentPin = pinStage === 'set' ? pinValue : pinConfirmValue;

        return (
          <View style={styles.stepContent}>
            <Ionicons name="lock-closed-outline" size={56} color={Colors.primary} />
            <Text style={styles.title}>
              {pinStage === 'set' ? 'Set Your PIN' : 'Confirm Your PIN'}
            </Text>
            <Text style={styles.subtitle}>
              {pinStage === 'set'
                ? 'Choose a 4-digit code to protect your settings.'
                : 'Enter the same PIN again to confirm.'}
            </Text>
            <PinDots length={currentPin.length} />
            <NumericKeypad onPress={handlePinDigit} onDelete={handlePinDelete} />
          </View>
        );

      case 'grace':
        return (
          <View style={styles.stepContent}>
            <Ionicons name="timer-outline" size={56} color={Colors.primary} />
            <Text style={styles.title}>Grace Period</Text>
            <Text style={styles.subtitle}>
              How many minutes after the scheduled time{'\n'}
              should we wait before alerting?
            </Text>

            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setGracePeriod((p) => Math.max(1, parseInt(p, 10) - 1).toString())}
                activeOpacity={0.6}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </TouchableOpacity>

              <View style={styles.stepperValueBox}>
                <Text style={styles.stepperValue}>{gracePeriod}</Text>
                <Text style={styles.stepperUnit}>minutes</Text>
              </View>

              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setGracePeriod((p) => Math.min(60, parseInt(p, 10) + 1).toString())}
                activeOpacity={0.6}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.hint}>Default: 15 minutes • Range: 1–60</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Progress bar */}
        <View style={styles.progressBar}>
          {STEPS.map((s, i) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                i <= currentIndex && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        {/* Step content — grows to fill space */}
        <View style={styles.content}>{renderStep()}</View>

        {/* Bottom section: error + buttons, fixed to bottom */}
        <View style={styles.bottomSection}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.buttons}>
            {currentIndex > 0 && (
              <TouchableOpacity style={styles.backButton} onPress={goBack} activeOpacity={0.7}>
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.nextButton}
              onPress={goNext}
              activeOpacity={0.7}
            >
              <Text style={styles.nextText}>Next →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  stepContent: {
    alignItems: 'center',
  },
  title: {
    ...Typography.h2,
    textAlign: 'center',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 18,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
    ...Shadows.card,
  },
  graceInput: {
    width: 140,
    textAlign: 'center',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginVertical: Spacing.lg,
  },
  stepperBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },
  stepperBtnText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textOnPrimary,
    lineHeight: 34,
  },
  stepperValueBox: {
    minWidth: 80,
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 44,
    fontWeight: '800',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  stepperUnit: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  hint: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
  bottomSection: {
    paddingBottom: Spacing.xl,
  },
  error: {
    fontSize: 14,
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  nextButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    ...Shadows.card,
  },
  nextText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
});
