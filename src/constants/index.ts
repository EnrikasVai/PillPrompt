import { AppSettings } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  caregiverPhone: '',
  gracePeriodMinutes: 15,
  seniorName: '',
  pinCode: '1234',
};

export const STORAGE_KEYS = {
  MEDICATIONS: '@pillprompt/medications',
  SETTINGS: '@pillprompt/settings',
  DOSE_LOG: '@pillprompt/doseLog',
} as const;

export const COLORS = {
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  danger: '#F44336',
  dangerDark: '#C62828',
  warning: '#FF9800',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#212121',
  textLight: '#757575',
  textWhite: '#FFFFFF',
  border: '#E0E0E0',
  pinDot: '#9E9E9E',
  pinDotFilled: '#212121',
} as const;

export const DAY_LABELS: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
