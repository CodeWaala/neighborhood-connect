import { WifiOff } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { API_URL } from '@/config';
import { spacing, textStyles, useTheme } from '@/theme';

import { Button } from './Button';
import { Screen } from './Screen';

/** Shown on launch when a saved session exists but the API can't be reached to check it. */
export function UnreachableScreen() {
  const { colors } = useTheme();
  const { retryRestore, signOut } = useAuth();

  return (
    <Screen style={styles.screen}>
      <View style={styles.body}>
        <View style={[styles.icon, { backgroundColor: colors.accentSoft }]}>
          <WifiOff size={28} color={colors.onAccentSoft} strokeWidth={2} />
        </View>
        <Text accessibilityRole="header" style={[textStyles.title, styles.center, { color: colors.foreground }]}>
          Can’t reach NearbyPals
        </Text>
        <Text style={[textStyles.body, styles.center, { color: colors.mutedForeground }]}>
          Check your connection and try again.
        </Text>
        {__DEV__ && (
          <Text style={[textStyles.label, styles.center, { color: colors.mutedForeground }]}>API: {API_URL}</Text>
        )}
      </View>
      <View style={styles.actions}>
        <Button label="Try again" onPress={retryRestore} />
        <Button label="Sign out" variant="outline" onPress={() => void signOut()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: spacing.xxl,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  center: {
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
});
