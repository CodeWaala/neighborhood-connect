import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { radius, textStyles, useTheme } from '@/theme';

type Variant = 'primary' | 'outline' | 'danger';
type Size = 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  /** `lg` = 56px full-width call to action; `md` = 48px card button. */
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  icon,
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const isPrimary = variant === 'primary';
  const textColor = isPrimary ? colors.onPrimary : variant === 'danger' ? colors.danger : colors.foreground;
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        isPrimary
          ? { backgroundColor: colors.primary }
          : { borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card },
        (pressed || inactive) && styles.dimmed,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={textColor} /> : icon}
      <Text style={[textStyles.button, size === 'lg' && styles.lgText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  lg: {
    height: 56,
    borderRadius: radius.largeButton,
  },
  md: {
    height: 48,
    borderRadius: radius.button,
  },
  lgText: {
    fontSize: 17,
  },
  dimmed: {
    opacity: 0.7,
  },
});
