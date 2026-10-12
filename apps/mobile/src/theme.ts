/**
 * Theme — colors, type and shape tokens for the mobile app.
 *
 * Ported from `apps/web/src/index.css`, using the adjusted values from the
 * NearbyPals Mobile designs (primary is darkened for white-text contrast).
 * The app follows the phone's system appearance; there is no in-app toggle.
 */

import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { useColorScheme } from 'react-native';

// ──────────────────────────────────────────────
// Colors
// ──────────────────────────────────────────────

export interface ThemeColors {
  background: string;
  card: string;
  foreground: string;
  mutedForeground: string;
  border: string;
  /** Filled buttons, active tab, links. */
  primary: string;
  /** Text and icons on `primary`. */
  onPrimary: string;
  /** Chips, avatar circles, neighborhood pill. */
  primarySoft: string;
  /** Text on `primarySoft`. */
  onPrimarySoft: string;
  /** "You're both free …" banner. */
  accentSoft: string;
  onAccentSoft: string;
  /** Notification badge (pending requests). */
  badge: string;
  onBadge: string;
}

export const lightColors: ThemeColors = {
  background: '#F9F8F4',
  card: '#FDFCF9',
  foreground: '#403326',
  mutedForeground: '#756457',
  border: '#E7E0DA',
  primary: '#40775C',
  onPrimary: '#FFFFFF',
  primarySoft: '#E6F0EB',
  onPrimarySoft: '#2F5A45',
  accentSoft: '#F9EBE6',
  onAccentSoft: '#8A3A1F',
  badge: '#C4552F',
  onBadge: '#FFFFFF',
};

export const darkColors: ThemeColors = {
  background: '#1F1914',
  card: '#2A231D',
  foreground: '#F5F4F0',
  mutedForeground: '#A3998F',
  border: '#403730',
  primary: '#64B48C',
  onPrimary: '#1F1914',
  primarySoft: '#293D33',
  onPrimarySoft: '#9ED3B6',
  accentSoft: '#422B24',
  onAccentSoft: '#F0A68C',
  badge: '#E07552',
  onBadge: '#1F1914',
};

// ──────────────────────────────────────────────
// Typography
// ──────────────────────────────────────────────

/** Font assets to load at startup (pass to `useFonts`). */
export const fontAssets = {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
};

/**
 * Nunito family names by weight. On native each weight is its own family,
 * so use these instead of `fontWeight`.
 */
export const fonts = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
} as const;

/** Type scale from the designs (font size / line height in px). */
export const textStyles = {
  title: { fontFamily: fonts.extrabold, fontSize: 32, lineHeight: 36 },
  heading: { fontFamily: fonts.extrabold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodySmall: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
  button: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 22 },
  chip: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 18 },
  tab: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14 },
} as const;

// ──────────────────────────────────────────────
// Shape & spacing
// ──────────────────────────────────────────────

export const radius = {
  banner: 12,
  button: 14,
  chip: 15,
  largeButton: 16,
  card: 22,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

/** Minimum touch target. */
export const hitSize = 44;

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export interface Theme {
  scheme: 'light' | 'dark';
  colors: ThemeColors;
}

/** Current theme, following the phone's light/dark setting. */
export function useTheme(): Theme {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { scheme, colors: scheme === 'dark' ? darkColors : lightColors };
}
