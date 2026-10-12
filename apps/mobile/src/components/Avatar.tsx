import { StyleSheet, Text, View } from 'react-native';

import { initial } from '@/lib/matching';
import { fonts, useTheme, type ThemeColors } from '@/theme';

type Tone = 'primary' | 'accent' | 'muted' | 'solid';

const TONES: Record<Tone, { bg: keyof ThemeColors; fg: keyof ThemeColors }> = {
  primary: { bg: 'primarySoft', fg: 'primary' },
  accent: { bg: 'accentSoft', fg: 'onAccentSoft' },
  muted: { bg: 'muted', fg: 'foreground' },
  solid: { bg: 'primary', fg: 'onPrimary' },
};

/** Initial-in-a-circle avatar (no photos in v1). Decorative: the name is always shown next to it. */
export function Avatar({ name, size = 52, tone = 'primary' }: { name: string | null | undefined; size?: number; tone?: Tone }) {
  const { colors } = useTheme();
  const { bg, fg } = TONES[tone];

  return (
    <View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors[bg] }]}
    >
      <Text style={[styles.letter, { fontSize: Math.round(size * 0.4), color: colors[fg] }]}>{initial(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontFamily: fonts.extrabold,
  },
});
