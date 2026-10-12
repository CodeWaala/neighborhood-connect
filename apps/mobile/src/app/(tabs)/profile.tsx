import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/Button';
import { Screen, ScreenTitle } from '@/components/Screen';
import { spacing, textStyles, useTheme } from '@/theme';

/** Profile tab. Routines, privacy toggle and editors land in M6; sign out is here now for testing. */
export default function ProfileScreen() {
  const { colors } = useTheme();
  const { email, signOut } = useAuth();

  return (
    <Screen edges={['top']}>
      <ScreenTitle title="Profile" />
      <View style={styles.body}>
        <Text style={[textStyles.bodySmall, { color: colors.mutedForeground }]}>
          Signed in as {email ?? 'a test user'}.
        </Text>
        <Button label="Sign out" variant="danger" size="md" onPress={() => void signOut()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
});
