import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Button } from '@/components/Button';
import { InterestPicker } from '@/components/pickers/InterestPicker';
import { useOnboarding } from '@/onboarding/OnboardingContext';
import { OnboardingScaffold } from '@/onboarding/OnboardingScaffold';
import { fonts, useTheme } from '@/theme';

/** Step 3: interests (at least one). */
export default function InterestsStep() {
  const { colors } = useTheme();
  const { interestIds, update } = useOnboarding();
  const count = interestIds.length;

  return (
    <OnboardingScaffold
      step={3}
      title="What do you enjoy?"
      subtitle="Pick the routines you’d happily share with a neighbor. Choose as many as you like."
      onBack={() => router.back()}
      footer={
        <>
          <Text accessibilityLiveRegion="polite" style={[styles.count, { color: colors.mutedForeground }]}>
            {count === 0 ? 'Select at least one interest' : `${count} selected`}
          </Text>
          <Button label="Continue" disabled={count === 0} onPress={() => router.push('/onboarding/availability')} />
        </>
      }
    >
      <InterestPicker selectedIds={interestIds} onChange={(ids) => update({ interestIds: ids })} />
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  count: {
    textAlign: 'center',
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
});
