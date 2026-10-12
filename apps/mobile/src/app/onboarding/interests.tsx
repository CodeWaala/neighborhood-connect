import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Baby, Coffee, Dog, MessageCircle, Sparkles, Trees } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { Screen } from '@/components/Screen';
import { listInterests } from '@/lib/interests-api';
import { useThemeColors } from '@/lib/theme-colors';
import { useOnboarding } from '@/onboarding/OnboardingContext';

function interestIcon(label: string, color: string): ReactNode {
  const props = { size: 18, color };
  switch (label) {
    case 'Stroller walks':
      return <Baby {...props} />;
    case 'Coffee outings':
      return <Coffee {...props} />;
    case 'Park visits':
      return <Trees {...props} />;
    case 'Dog walks':
      return <Dog {...props} />;
    case 'Casual chats':
      return <MessageCircle {...props} />;
    default:
      return <Sparkles {...props} />;
  }
}

export default function OnboardingInterests() {
  const router = useRouter();
  const colors = useThemeColors();
  const { interestIds, setInterestIds } = useOnboarding();

  const { data: interests, isLoading, isError } = useQuery({
    queryKey: ['interests'],
    queryFn: listInterests,
    staleTime: 5 * 60 * 1000,
  });

  function toggle(id: string) {
    setInterestIds(interestIds.includes(id) ? interestIds.filter((i) => i !== id) : [...interestIds, id]);
  }

  return (
    <Screen>
      <OnboardingProgress step={3} onBack={() => router.back()} />
      <ScrollView contentContainerClassName="flex-1 justify-center gap-6 p-6">
        <View className="gap-2">
          <Text className="text-center font-sans text-2xl font-bold text-foreground">
            What do you enjoy?
          </Text>
          <Text className="text-center font-sans text-base text-muted-foreground">
            Pick all that apply. Shared interests help us find your best matches.
          </Text>
        </View>

        {isLoading && <ActivityIndicator color={colors.primary} />}
        {isError && (
          <Text className="text-center font-sans text-sm text-destructive">
            Failed to load interests. Please try again.
          </Text>
        )}

        <View className="flex-row flex-wrap justify-center gap-3">
          {interests?.map((interest) => {
            const isSelected = interestIds.includes(interest.id);
            return (
              <Chip
                key={interest.id}
                label={interest.label}
                selected={isSelected}
                icon={interestIcon(interest.label, isSelected ? colors.primary : colors.foreground)}
                onPress={() => toggle(interest.id)}
              />
            );
          })}
        </View>

        <Text className="text-center font-sans text-sm text-muted-foreground">
          {interestIds.length === 0 ? 'Select at least one interest' : `${interestIds.length} selected`}
        </Text>

        <Button
          label="Next"
          onPress={() => router.push('/onboarding/availability')}
          disabled={interestIds.length === 0 || isLoading}
        />
      </ScrollView>
    </Screen>
  );
}
