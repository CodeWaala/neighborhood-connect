import { useColorScheme } from 'react-native';

/**
 * Icon `color` props (lucide-react-native) and other non-className style
 * values can't read NativeWind's CSS variables, so this mirrors the same
 * HSL tokens from global.css as plain color strings.
 */
const palettes = {
  light: {
    foreground: 'hsl(25, 25%, 20%)',
    mutedForeground: 'hsl(25, 15%, 50%)',
    primary: 'hsl(150, 30%, 45%)',
    primaryForeground: 'hsl(45, 30%, 98%)',
    accent: 'hsl(15, 80%, 65%)',
    destructive: 'hsl(0, 65%, 55%)',
    border: 'hsl(30, 20%, 88%)',
    card: 'hsl(45, 40%, 99%)',
    placeholder: 'hsl(25, 15%, 50%)',
  },
  dark: {
    foreground: 'hsl(45, 20%, 95%)',
    mutedForeground: 'hsl(30, 10%, 60%)',
    primary: 'hsl(150, 35%, 55%)',
    primaryForeground: 'hsl(25, 20%, 10%)',
    accent: 'hsl(15, 70%, 60%)',
    destructive: 'hsl(0, 55%, 45%)',
    border: 'hsl(25, 15%, 22%)',
    card: 'hsl(25, 18%, 14%)',
    placeholder: 'hsl(30, 10%, 60%)',
  },
};

export type ThemeColors = typeof palettes.light;

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return palettes[scheme === 'dark' ? 'dark' : 'light'];
}
