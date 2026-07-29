/**
 * PillPrompt Design System
 * Warm, medical, senior-friendly — high contrast, big touch targets, clear hierarchy.
 */

export const Colors = {
  // Primary palette
  primary: '#2A9D8F',        // Teal — calm, medical, trustworthy
  primaryLight: '#40BFAF',
  primaryDark: '#1E7A6E',
  primaryPale: '#E8F5F3',

  // Accent
  accent: '#E9C46A',         // Warm gold — friendly highlights
  accentLight: '#F5D88A',

  // Status
  success: '#4CAF50',
  successLight: '#E8F5E9',
  danger: '#E63946',
  dangerLight: '#FFEBEE',
  warning: '#F4A261',

  // Neutrals
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F0F4F4',

  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#555770',
  textTertiary: '#8E8EA0',
  textOnPrimary: '#FFFFFF',
  textOnDanger: '#FFFFFF',

  // Borders & shadows
  border: '#E8ECF0',
  shadow: 'rgba(0, 0, 0, 0.08)',
};

export const Typography = {
  hero: { fontSize: 44, fontWeight: '800' as const, color: Colors.textPrimary },
  h1: { fontSize: 32, fontWeight: '700' as const, color: Colors.textPrimary },
  h2: { fontSize: 24, fontWeight: '700' as const, color: Colors.textPrimary },
  h3: { fontSize: 20, fontWeight: '600' as const, color: Colors.textPrimary },
  body: { fontSize: 16, fontWeight: '400' as const, color: Colors.textSecondary },
  bodyBold: { fontSize: 16, fontWeight: '600' as const, color: Colors.textPrimary },
  caption: { fontSize: 13, fontWeight: '400' as const, color: Colors.textTertiary },
  button: { fontSize: 22, fontWeight: '700' as const, color: Colors.textOnPrimary },
  timer: { fontSize: 52, fontWeight: '700' as const, color: Colors.primary, fontVariant: ['tabular-nums' as const] },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const Shadows = {
  card: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  button: {
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonPressed: {
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
};

export const Layout = {
  screenPadding: Spacing.lg,
  buttonMinHeight: 68,
  iconSize: 48,
};

export const DAY_LABELS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
