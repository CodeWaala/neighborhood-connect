import { Check } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, useTheme } from '@/theme';

type Variant = 'soft' | 'filled' | 'outline' | 'muted';

/** Pill label for interests, roles and neighborhoods. `filled` adds a check (e.g. "shared with you"). */
export function Chip({ label, variant = 'soft', size = 'sm' }: { label: string; variant?: Variant; size?: 'sm' | 'md' }) {
  const { colors } = useTheme();
  const height = size === 'md' ? 34 : 30;

  const palette = {
    soft: { bg: colors.primarySoft, fg: colors.onPrimarySoft, border: 'transparent' },
    filled: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
    outline: { bg: 'transparent', fg: colors.foreground, border: colors.border },
    muted: { bg: colors.muted, fg: colors.foreground, border: 'transparent' },
  }[variant];

  return (
    <View
      style={[
        styles.chip,
        { height, borderRadius: height / 2, backgroundColor: palette.bg, borderColor: palette.border },
      ]}
    >
      {variant === 'filled' && <Check size={14} color={palette.fg} strokeWidth={3} />}
      <Text style={[styles.label, size === 'md' && styles.labelMd, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderWidth: 1.5,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  labelMd: {
    fontSize: 14,
  },
});
