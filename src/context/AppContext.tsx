import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { Medication, AppSettings, DoseLogEntry } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { generateUUID } from '../utils/uuid';
import { loadAllData, saveMedications, saveSettings, saveDoseLog } from '../services/storage';
import { rescheduleAllNotifications, checkLowStockNotifications } from '../services/notifications';

// ─── State ────────────────────────────────────────────────

interface AppState {
  medications: Medication[];
  settings: AppSettings;
  doseLog: DoseLogEntry[];
  isHydrated: boolean;
}

const initialState: AppState = {
  medications: [],
  settings: DEFAULT_SETTINGS,
  doseLog: [],
  isHydrated: false,
};

// ─── Actions ──────────────────────────────────────────────

type AppAction =
  | { type: 'HYDRATE'; medications: Medication[]; settings: AppSettings | null; doseLog: DoseLogEntry[] }
  | { type: 'ADD_MEDICATION'; medication: Medication }
  | { type: 'UPDATE_MEDICATION'; medication: Medication }
  | { type: 'DELETE_MEDICATION'; id: string }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AppSettings> }
  | { type: 'LOG_DOSE'; entry: DoseLogEntry }
  | { type: 'CLEAR_DOSE_LOG' }
  | { type: 'DECREMENT_PILL_COUNT'; medicationId: string };

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return {
        ...state,
        medications: action.medications.map((m) => ({
          ...m,
          // Backwards compatibility: old data won't have pillCount/remainingPills
          pillCount: m.pillCount ?? 0,
          remainingPills: m.remainingPills ?? 0,
        })),
        settings: action.settings ?? DEFAULT_SETTINGS,
        doseLog: action.doseLog,
        isHydrated: true,
      };

    case 'ADD_MEDICATION':
      return { ...state, medications: [...state.medications, action.medication] };

    case 'UPDATE_MEDICATION':
      return {
        ...state,
        medications: state.medications.map((m) =>
          m.id === action.medication.id ? action.medication : m,
        ),
      };

    case 'DELETE_MEDICATION':
      return {
        ...state,
        medications: state.medications.filter((m) => m.id !== action.id),
      };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };

    case 'LOG_DOSE':
      return { ...state, doseLog: [...state.doseLog, action.entry] };

    case 'CLEAR_DOSE_LOG':
      return { ...state, doseLog: [] };

    case 'DECREMENT_PILL_COUNT':
      return {
        ...state,
        medications: state.medications.map((m) =>
          m.id === action.medicationId && m.remainingPills > 0
            ? { ...m, remainingPills: m.remainingPills - 1 }
            : m,
        ),
      };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addMedication: (med: Omit<Medication, 'id'>) => void;
  updateMedication: (med: Medication) => void;
  deleteMedication: (id: string) => void;
  logDose: (medicationId: string, scheduledDate: string, scheduledTime: string, status: DoseLogEntry['status']) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  clearDoseLog: () => void;
  decrementPillCount: (medicationId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const isFirstHydration = useRef(true);

  // Hydrate from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      const data = await loadAllData();
      dispatch({ type: 'HYDRATE', ...data });
    })();
  }, []);

  // Re-schedule notifications whenever medications change (after initial hydration)
  useEffect(() => {
    if (isFirstHydration.current) {
      isFirstHydration.current = false;
      return;
    }
    rescheduleAllNotifications(state.medications);
  }, [state.medications]);

  // Check for low stock when remaining pills change (after a dose is taken)
  const prevRemainingRef = useRef<Record<string, number>>({});
  useEffect(() => {
    if (!state.isHydrated) return;
    // Skip notification on first hydration — don't re-notify for already-low stock
    const isFirstRun = Object.keys(prevRemainingRef.current).length === 0;

    if (!isFirstRun) {
      for (const med of state.medications) {
        const prev = prevRemainingRef.current[med.id];
        // Only notify when count JUST dropped from >5 to ≤5
        if (
          prev !== undefined &&
          prev > 5 &&
          med.pillCount > 0 &&
          med.remainingPills > 0 &&
          med.remainingPills <= 5
        ) {
          checkLowStockNotifications(state.medications);
          break;
        }
      }
    }

    // Always store current values for next comparison
    prevRemainingRef.current = Object.fromEntries(
      state.medications.map((m) => [m.id, m.remainingPills]),
    );
  }, [state.medications, state.isHydrated]);

  // Persist to AsyncStorage on change (debounced)
  useEffect(() => {
    if (!state.isHydrated) return;
    const timer = setTimeout(() => {
      saveMedications(state.medications);
      saveSettings(state.settings);
      saveDoseLog(state.doseLog);
    }, 300);
    return () => clearTimeout(timer);
  }, [state.medications, state.settings, state.doseLog, state.isHydrated]);

  // ─── Convenience action creators ────────────────────────

  const addMedication = useCallback((med: Omit<Medication, 'id'>) => {
    const medication: Medication = { ...med, id: generateUUID() };
    dispatch({ type: 'ADD_MEDICATION', medication });
  }, []);

  const updateMedication = useCallback((med: Medication) => {
    dispatch({ type: 'UPDATE_MEDICATION', medication: med });
  }, []);

  const deleteMedication = useCallback((id: string) => {
    dispatch({ type: 'DELETE_MEDICATION', id });
  }, []);

  const logDose = useCallback(
    (medicationId: string, scheduledDate: string, scheduledTime: string, status: DoseLogEntry['status']) => {
      const entry: DoseLogEntry = {
        id: generateUUID(),
        medicationId,
        scheduledDate,
        scheduledTime,
        status,
        timestamp: new Date().toISOString(),
      };
      dispatch({ type: 'LOG_DOSE', entry });
      if (status === 'taken') {
        dispatch({ type: 'DECREMENT_PILL_COUNT', medicationId });
      }
    },
    [],
  );

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings });
  }, []);

  const clearDoseLog = useCallback(() => {
    dispatch({ type: 'CLEAR_DOSE_LOG' });
  }, []);

  const decrementPillCount = useCallback((medicationId: string) => {
    dispatch({ type: 'DECREMENT_PILL_COUNT', medicationId });
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        addMedication,
        updateMedication,
        deleteMedication,
        logDose,
        updateSettings,
        clearDoseLog,
        decrementPillCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
