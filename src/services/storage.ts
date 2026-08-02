import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medication, AppSettings, DoseLogEntry } from '../types';
import { STORAGE_KEYS } from '../constants';

// ─── Medications ──────────────────────────────────────────

export async function loadMedications(): Promise<Medication[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.MEDICATIONS);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function saveMedications(medications: Medication[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications));
  } catch {
    // Silently fail — app still works with in-memory data
  }
}

// ─── Settings ─────────────────────────────────────────────

export async function loadSettings(): Promise<AppSettings | null> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // Silently fail
  }
}

// ─── Dose Log ─────────────────────────────────────────────

export async function loadDoseLog(): Promise<DoseLogEntry[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.DOSE_LOG);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

// ─── Last Check Date (for missed-dose backfill) ───────────

export async function loadLastCheckDate(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.LAST_CHECK_DATE);
  } catch {
    return null;
  }
}

export async function saveLastCheckDate(date: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_CHECK_DATE, date);
  } catch {
    // Silently fail
  }
}

export async function saveDoseLog(log: DoseLogEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.DOSE_LOG, JSON.stringify(log));
  } catch {
    // Silently fail
  }
}

// ─── Bulk ─────────────────────────────────────────────────

export async function loadAllData(): Promise<{
  medications: Medication[];
  settings: AppSettings | null;
  doseLog: DoseLogEntry[];
}> {
  const [medications, settings, doseLog] = await Promise.all([
    loadMedications(),
    loadSettings(),
    loadDoseLog(),
  ]);
  return { medications, settings, doseLog };
}
