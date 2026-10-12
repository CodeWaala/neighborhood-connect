import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { AvailabilityPicker } from '@/components/pickers/AvailabilityPicker';
import { useOnboarding } from '@/onboarding/OnboardingContext';
import { OnboardingScaffold } from '@/onboarding/OnboardingScaffold';
import { radius, spacing, textStyles, useTheme } from '@/theme';

/** Step 4: days and time windows, then create the profile. */
export default function AvailabilityStep() {
  const { colors } = useTheme();
  const { days, windowIds, update, submit, isSubmitting } = useOnboarding();
  const [error, setError] = useState<string | null>(null);

  const canFinish = days.length > 0 && windowIds.length > 0;

  async function handleFinish() {
    setError(null);
    try {
      // On success the routing guard switches to the tabs (Discover)
      await submit();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <OnboardingScaffold
      step={4}
      title="When are you free?"
      subtitle="We’ll only match you with neighbors whose routines overlap with yours."
      onBack={() => router.back()}
      footer={
        <>
          {error && (
            <View accessibilityRole="alert" style={[styles.error, { backgroundColor: colors.accentSoft }]}>
              <Text style={[textStyles.label, { color: colors.onAccentSoft }]}>{error}</Text>
            </View>
          )}
          <Button
            label="Find my matches"
            disabled={!canFinish}
            loading={isSubmitting}
            onPress={() => void handleFinish()}
          />
        </>
      }
    >
      <AvailabilityPicker days={days} windowIds={windowIds} onChange={(next) => update(next)} />
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  error: {
    borderRadius: radius.banner,
    padding: spacing.md,
  },
});
