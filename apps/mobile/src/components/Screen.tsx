import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { spacing, textStyles, useTheme } from '@/theme';

interface ScreenProps {
  children: ReactNode;
  /** Tab screens sit above the tab bar, so they skip the bottom inset. */
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
}

/** Full-screen container with the theme background and safe-area padding. */
export function Screen({ children, edges = ['top', 'bottom'], style }: ScreenProps) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={edges} style={[styles.screen, { backgroundColor: colors.background }, style]}>
      {children}
    </SafeAreaView>
  );
}

/** Large page title used at the top of tab screens ("Your matches", "Connections", "Profile"). */
export function ScreenTitle({ title, right }: { title: string; right?: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.titleRow}>
      <Text accessibilityRole="header" style={[textStyles.title, { color: colors.foreground }]}>
        {title}
      </Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
});
