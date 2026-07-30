/** A single medication the senior takes */
export interface Medication {
  id: string;               // UUID v4
  name: string;             // e.g. "Metformin"
  dosage: string;           // e.g. "1 tablet – 500mg"
  time: string;             // "08:00" (24h format, HH:mm)
  daysOfWeek: number[];     // 0 (Mon) – 6 (Sun). Empty array = every day.
  enabled: boolean;         // Soft disable without deleting
  pillCount: number;        // Starting pill count (e.g. 30). 0 = not tracked.
  remainingPills: number;   // Current remaining count. Decrements on "taken".
}

/** App-wide caregiver settings */
export interface AppSettings {
  caregiverPhone: string;       // e.g. "+15551234567"
  gracePeriodMinutes: number;   // Default 15
  seniorName: string;           // e.g. "Mom"
  pinCode: string;              // 4-digit PIN (plaintext for MVP)
}

/** A single logged dose event */
export interface DoseLogEntry {
  id: string;               // UUID v4
  medicationId: string;     // FK to Medication.id
  scheduledDate: string;    // "2026-07-29" (YYYY-MM-DD)
  scheduledTime: string;    // "08:00" (HH:mm)
  status: 'taken' | 'missed' | 'snoozed';
  timestamp: string;        // ISO 8601 — when the action occurred
}

/** Navigation param list for type-safe routing */
export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  CaregiverSetup: undefined;
  PinGate: undefined;
  AddMedication: { medicationId?: string } | undefined;
  Settings: undefined;
  DoseLog: undefined;
  ChangePin: undefined;
};

/** Derived / computed: the next scheduled dose (not persisted) */
export interface UpcomingDose {
  medication: Medication;
  scheduledDateTime: Date;   // Full Date for today's instance
  graceEndDateTime: Date;    // scheduledDateTime + gracePeriodMinutes
  status: 'upcoming' | 'in-grace' | 'taken' | 'missed';
}
