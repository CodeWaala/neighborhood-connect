import { router } from 'expo-router';

import { Button } from '@/components/Button';
import { RolePicker } from '@/components/pickers/RolePicker';
import { useOnboarding } from '@/onboarding/OnboardingContext';
import { OnboardingScaffold } from '@/onboarding/OnboardingScaffold';

/** Step 2: parent, pet parent, or both. */
export default function RoleStep() {
  const { role, update } = useOnboarding();

  return (
    <OnboardingScaffold
      step={2}
      title="I am a..."
      subtitle="This helps us match you with neighbors in a similar stage of life."
      onBack={() => router.back()}
      footer={<Button label="Continue" disabled={!role} onPress={() => router.push('/onboarding/interests')} />}
    >
      <RolePicker value={role} onChange={(id) => update({ role: id })} />
    </OnboardingScaffold>
  );
}
