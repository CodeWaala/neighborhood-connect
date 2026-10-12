import { ActivityIndicator, StyleSheet } from 'react-native';

import { useTheme } from '@/theme';

/** Spinner for a screen whose data hasn't arrived yet. */
export function Loading() {
  const { colors } = useTheme();
  return <ActivityIndicator accessibilityLabel="Loading" color={colors.primary} style={styles.spinner} />;
}

const styles = StyleSheet.create({
  spinner: {
    marginTop: 80,
  },
});
