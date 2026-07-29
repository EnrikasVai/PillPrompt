import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Medication, AppSettings, DoseLogEntry } from '../types';
import { detectMissedDoses } from '../services/doseChecker';

/**
 * Runs missed-dose detection on every app foreground event and on an interval.
 * When a missed dose is found, it logs it. The HomeScreen shows the missed
 * state visually — no external alert is sent.
 */
export function useMissedDoseCheck(
  medications: Medication[],
  doseLog: DoseLogEntry[],
  settings: AppSettings,
  logDose: (medicationId: string, scheduledDate: string, scheduledTime: string, status: 'missed') => void,
) {
  const loggedRef = useRef<Set<string>>(new Set());

  const checkAndLog = () => {
    const missed = detectMissedDoses(medications, doseLog, settings);
    for (const med of missed) {
      const key = `${med.id}_${med.time}`;
      if (loggedRef.current.has(key)) continue;
      loggedRef.current.add(key);

      const today = new Date().toISOString().slice(0, 10);
      logDose(med.id, today, med.time, 'missed');
    }
  };

  // Check on foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        checkAndLog();
      }
    });
    return () => sub.remove();
  }, [medications, doseLog]);

  // Check on interval (every 60 seconds while app is open)
  useEffect(() => {
    const interval = setInterval(checkAndLog, 60_000);
    checkAndLog();
    return () => clearInterval(interval);
  }, [medications, doseLog]);
}
