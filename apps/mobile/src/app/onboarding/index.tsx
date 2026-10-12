import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { spacing, textStyles, useTheme } from '@/theme';

/** Placeholder until the onboarding screens land in M3 (name & neighborhood → role → interests → availability). */
export default function OnboardingStart() {
  const { colors } = useTheme();
  const { email, signOut } = useAuth();

  return (
    <Screen style={styles.screen}>
      <View style={styles.body}>
        <Text accessibilityRole="header" style={[textStyles.title, { color: colors.foreground }]}>
          Let’s set up your profile
        </Text>
        <Text style={[textStyles.body, { color: colors.mutedForeground }]}>
          Signed in as {email ?? 'a new test user'}. Onboarding screens are coming next.
        </Text>
      </View>
      <Button label="Sign out" variant="outline" onPress={() => void signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
});
