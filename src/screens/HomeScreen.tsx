import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import { RootStackParamList, DoseLogEntry } from '../types';
import { useApp } from '../context/AppContext';
import { useUpcomingDose } from '../hooks/useUpcomingDose';
import { useMissedDoseCheck } from '../hooks/useMissedDoseCheck';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout } from '../theme';
import { formatTime, jsDayToAppDay } from '../utils/formatters';
import { CountdownTimer } from '../components/CountdownTimer';
import { TakenButton } from '../components/TakenButton';
import { TakenState } from '../components/TakenState';
import { MissedState } from '../components/MissedState';
import { NoDosesState } from '../components/NoDosesState';
import { SkippedState } from '../components/SkippedState';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface TodayDose {
  medicationId: string;
  name: string;
  dosage: string;
  time: string;
  status: 'upcoming' | 'taken' | 'missed' | 'in-grace' | 'skipped';
  logEntry?: DoseLogEntry;
  lowStock: boolean;
  remainingPills: number;
}

export function HomeScreen({ navigation }: Props) {
  const { state, logDose } = useApp();
  const upcoming = useUpcomingDose(state.medications, state.settings);

  const [takenMedIds, setTakenMedIds] = useState<Set<string>>(new Set());
  const [skippedMedIds, setSkippedMedIds] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    setTakenMedIds(new Set());
    setSkippedMedIds(new Set());
  }, [upcoming?.scheduledDateTime.getTime()]);

  useMissedDoseCheck(state.medications, state.doseLog, state.settings, logDose);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAppDay = jsDayToAppDay(new Date().getDay());

  // Find all medications that share the same time as the upcoming dose
  const sameTimeMeds = useMemo(() => {
    if (!upcoming) return [];
    return state.medications.filter(
      (m) =>
        m.enabled &&
        m.time === upcoming.medication.time &&
        (m.daysOfWeek.length === 0 || m.daysOfWeek.includes(todayAppDay)) &&
        !state.doseLog.some(
          (log) =>
            log.medicationId === m.id &&
            log.scheduledDate === todayStr &&
            log.scheduledTime === m.time &&
            (log.status === 'taken' || log.status === 'missed' || log.status === 'skipped'),
        ),
    );
  }, [upcoming, state.medications, state.doseLog, todayStr, todayAppDay]);

  const handleTaken = useCallback(() => {
    if (!upcoming || sameTimeMeds.length === 0) return;
    const ids: string[] = [];
    for (const med of sameTimeMeds) {
      logDose(med.id, todayStr, med.time, 'taken');
      ids.push(med.id);
    }
    setTakenMedIds(new Set(ids));
  }, [upcoming, sameTimeMeds, logDose, todayStr]);

  const handleSkip = useCallback(() => {
    if (!upcoming || sameTimeMeds.length === 0) return;
    const label = sameTimeMeds.length > 1
      ? `Skip ${sameTimeMeds.length} medications for today?`
      : `Skip ${sameTimeMeds[0].name} for today?`;
    Alert.alert('Skip Dose', label, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Skip',
        style: 'destructive',
        onPress: () => {
          const ids: string[] = [];
          for (const med of sameTimeMeds) {
            logDose(med.id, todayStr, med.time, 'skipped');
            ids.push(med.id);
          }
          setSkippedMedIds(new Set(ids));
        },
      },
    ]);
  }, [upcoming, sameTimeMeds, logDose, todayStr]);

  const hasMedications = state.medications.some((m) => m.enabled);

  // ── Compute today's doses ──
  const todayDoses = useMemo((): TodayDose[] => {
    const today = new Date();
    const todayStr = dayjs(today).format('YYYY-MM-DD');
    const todayDay = jsDayToAppDay(today.getDay());

    return state.medications
      .filter((m) => m.enabled && (m.daysOfWeek.length === 0 || m.daysOfWeek.includes(todayDay)))
      .map((med) => {
        const log = state.doseLog.find(
          (l) =>
            l.medicationId === med.id &&
            l.scheduledDate === todayStr &&
            l.scheduledTime === med.time,
        );

        let status: TodayDose['status'] = 'upcoming';
        if (log) {
          status = log.status as TodayDose['status'];
        } else {
          const [h, m] = med.time.split(':').map(Number);
          const scheduled = dayjs(`${todayStr}T${med.time}`);
          const graceEnd = scheduled.add(state.settings.gracePeriodMinutes, 'minute');
          const now = dayjs(today);
          if (now.isAfter(graceEnd)) {
            status = 'missed';
          } else if (now.isAfter(scheduled)) {
            status = 'in-grace';
          }
        }

        return {
          medicationId: med.id,
          name: med.name,
          dosage: med.dosage,
          time: med.time,
          status,
          logEntry: log,
          lowStock: med.pillCount > 0 && med.remainingPills > 0 && med.remainingPills <= 5,
          remainingPills: med.remainingPills,
        };
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [state.medications, state.doseLog, state.settings]);

  const totalToday = todayDoses.length;
  const takenCount = todayDoses.filter((d) => d.status === 'taken').length;
  const progressPercent = totalToday > 0 ? (takenCount / totalToday) * 100 : 0;

  const currentMissed = upcoming && sameTimeMeds.length > 0
    ? sameTimeMeds.every((med) =>
        state.doseLog.some(
          (log) =>
            log.medicationId === med.id &&
            log.scheduledDate === todayStr &&
            log.scheduledTime === med.time &&
            log.status === 'missed',
        ),
      )
    : false;

  // ── Render ──

  const lowStockMeds = state.medications.filter(
    (m) => m.enabled && m.pillCount > 0 && m.remainingPills > 0 && m.remainingPills <= 5,
  );

  const renderLowStockBanner = () => {
    if (lowStockMeds.length === 0) return null;
    return (
      <View style={styles.lowStockCard}>
        <Ionicons name="warning-outline" size={20} color={Colors.warning} />
        <View style={styles.lowStockInfo}>
          <Text style={styles.lowStockTitle}>Refill needed</Text>
          {lowStockMeds.map((m) => (
            <Text key={m.id} style={styles.lowStockText}>
              {m.name} — {m.remainingPills} left
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const renderTodayPlan = () => (
    <>
      {/* Greeting */}
      <Text style={styles.greeting}>
        Hello{state.settings.seniorName ? `, ${state.settings.seniorName}` : ''}
      </Text>

      {/* Progress card */}
      {totalToday > 0 && (
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressTitleRow}>
              <Ionicons name="clipboard-outline" size={20} color={Colors.primary} />
              <Text style={styles.progressTitle}>Your Plan for Today</Text>
            </View>
            <Text style={styles.progressCount}>
              {takenCount}/{totalToday} taken
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>
      )}

      {/* Today's medications list */}
      {totalToday > 0 && (
        <View style={styles.todayList}>
          {todayDoses.map((dose) => {
            const isActive = upcoming && dose.time === upcoming.medication.time;

            return (
              <View
                key={`${dose.medicationId}-${dose.time}`}
                style={[styles.todayItem, isActive && styles.todayItemActive]}
              >
                <View style={styles.todayItemLeft}>
                  <Text style={styles.todayTime}>{formatTime(dose.time)}</Text>
                  <View style={styles.todayItemInfo}>
                    <Text style={[styles.todayName, isActive && styles.todayNameActive]}>
                      {dose.name}
                    </Text>
                    <Text style={styles.todayDosage}>{dose.dosage}</Text>
                    {dose.lowStock && (
                      <View style={styles.lowBadge}>
                        <Ionicons name="warning-outline" size={12} color={Colors.warning} />
                        <Text style={styles.lowBadgeText}>{dose.remainingPills} left</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.todayStatus}>
                  {dose.status === 'taken' && <Ionicons name="checkmark-circle" size={24} color={Colors.success} />}
                  {dose.status === 'missed' && <Ionicons name="close-circle" size={24} color={Colors.danger} />}
                  {dose.status === 'skipped' && <Ionicons name="close" size={24} color={Colors.textTertiary} />}
                  {dose.status === 'in-grace' && <Ionicons name="hourglass-outline" size={24} color={Colors.warning} />}
                  {dose.status === 'upcoming' && <Ionicons name="time-outline" size={24} color={Colors.textTertiary} />}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </>
  );

  const renderActiveDose = () => {
    if (!upcoming) return null;
    if (takenMedIds.size > 0 && sameTimeMeds.every((m) => takenMedIds.has(m.id))) return null;
    if (skippedMedIds.size > 0 && sameTimeMeds.every((m) => skippedMedIds.has(m.id))) return null;
    if (currentMissed) return null;

    const isBeforeSchedule = upcoming.status === 'upcoming' && new Date() < upcoming.scheduledDateTime;
    const isMulti = sameTimeMeds.length > 1;

    return (
      <View style={styles.activeSection}>
        <View style={styles.activeCard}>
          <Text style={styles.activeLabel}>
            <Ionicons name="alarm-outline" size={16} color={Colors.primary} /> TIME TO TAKE
          </Text>

          {sameTimeMeds.map((med, idx) => (
            <View key={med.id}>
              <Text style={styles.activeName}>{med.name}</Text>
              <Text style={styles.activeDosage}>{med.dosage}</Text>
              {idx < sameTimeMeds.length - 1 && <View style={styles.activeDivider} />}
            </View>
          ))}

          <CountdownTimer targetDate={upcoming.graceEndDateTime} />
          <TakenButton onPress={handleTaken} disabled={isBeforeSchedule} />
          {isBeforeSchedule && (
            <View style={styles.noticeBanner}>
              <Ionicons name="hourglass-outline" size={16} color={Colors.warning} />
              <Text style={styles.noticeText}> Not yet — wait for your scheduled time</Text>
            </View>
          )}
          {isMulti && !isBeforeSchedule && (
            <Text style={styles.multiHint}>All medications at this time will be marked as taken</Text>
          )}

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
            <Ionicons name="close-circle-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.skipText}> Skip Dose</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    // Empty state
    if (!hasMedications) {
      return (
        <View style={styles.emptyCard}>
          <Ionicons name="medkit-outline" size={56} color={Colors.primary} />
          <Text style={styles.emptyTitle}>Welcome to PillPrompt</Text>
          <Text style={styles.emptyText}>
            No medications set up yet.{'\n'}
            Ask your caregiver to add some.
          </Text>
          <TouchableOpacity
            style={styles.emptySetupBtn}
            onPress={() => navigation.navigate('PinGate')}
            activeOpacity={0.7}
          >
            <Text style={styles.emptySetupText}>Go to Setup</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Taken all at this time slot
    if (takenMedIds.size > 0 && upcoming) {
      const allSameTimeTaken = sameTimeMeds.every((m) => takenMedIds.has(m.id));
      if (allSameTimeTaken) {
        return (
          <>
            {renderTodayPlan()}
            <TakenState seniorName={state.settings.seniorName} />
          </>
        );
      }
    }

    // Skipped all at this time slot
    if (skippedMedIds.size > 0 && upcoming) {
      const allSameTimeSkipped = sameTimeMeds.every((m) => skippedMedIds.has(m.id));
      if (allSameTimeSkipped) {
        return (
          <>
            {renderTodayPlan()}
            <SkippedState seniorName={state.settings.seniorName} />
          </>
        );
      }
    }

    // Missed
    if (currentMissed && upcoming) {
      return (
        <>
          {renderTodayPlan()}
          <MissedState
            medicationName={upcoming.medication.name}
            caregiverPhone={state.settings.caregiverPhone}
          />
        </>
      );
    }

    // No more doses for today
    if (totalToday === 0) {
      return <NoDosesState />;
    }

    // Normal view: today's plan + active dose
    return (
      <>
        {renderTodayPlan()}
        {renderActiveDose()}
        {totalToday > 0 && takenCount === totalToday && (
          <TakenState seniorName={state.settings.seniorName} />
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.topBarTitle}>PillPrompt</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('PinGate')}
            style={styles.topBarBtn}
            activeOpacity={0.6}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}

          {/* Running low banner */}
          {renderLowStockBanner()}

          {/* Always-visible call caregiver button */}
          {state.settings.caregiverPhone ? (
            <TouchableOpacity
              style={styles.callHelpBtn}
              onPress={() => {
                const url = `tel:${state.settings.caregiverPhone}`;
                Linking.canOpenURL(url).then((ok) => ok && Linking.openURL(url));
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="call-outline" size={22} color={Colors.textOnPrimary} />
              <Text style={styles.callHelpText}> Call Caregiver</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </View>
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
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topBarTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  topBarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flexGrow: 1,
    padding: Layout.screenPadding,
    paddingTop: Spacing.md,
  },

  // ── Empty state ──
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    ...Shadows.card,
    marginTop: Spacing.xl,
  },
  progressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: Spacing.lg,
  },
  emptySetupBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  emptySetupText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },

  // ── Greeting ──
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },

  // ── Progress card ──
  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  progressCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },

  // ── Today's list ──
  todayList: {
    marginBottom: Spacing.md,
  },
  todayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  todayItemActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryPale,
    borderWidth: 2,
  },
  todayItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  todayTime: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSecondary,
    minWidth: 60,
  },
  todayItemInfo: {
    flex: 1,
  },
  todayName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  todayNameActive: {
    color: Colors.primaryDark,
    fontSize: 18,
  },
  todayDosage: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  todayStatus: {
    marginLeft: Spacing.sm,
  },

  // ── Active dose section ──
  activeSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  activeCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary + '40',
    ...Shadows.card,
  },
  activeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 1.5,
    marginBottom: Spacing.xs,
  },
  activeName: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  activeDosage: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  activeDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  multiHint: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent + '20',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    marginTop: Spacing.sm,
  },
  noticeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  callHelpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.card,
  },
  callHelpText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },

  // ── Low stock ──
  lowStockCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.warning + '18',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.warning,
    padding: Spacing.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  lowStockInfo: {
    flex: 1,
  },
  lowStockTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  lowStockText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  lowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  lowBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.warning,
  },
});
