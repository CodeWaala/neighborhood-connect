import { useRouter } from 'expo-router';
import { Baby, Dog, Heart } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { Screen } from '@/components/Screen';
import { useThemeColors } from '@/lib/theme-colors';
import { useOnboarding, type OnboardingRole as RoleType } from '@/onboarding/OnboardingContext';

function RoleCard({
  icon,
  title,
  description,
  selected,
  onPress,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-2xl border-2 p-5 ${selected ? 'border-primary bg-primary-soft' : 'border-border bg-card'}`}>
      <View className="flex-row items-start gap-4">
        <View
          className={`h-12 w-12 items-center justify-center rounded-full ${
            selected ? 'bg-primary' : 'bg-primary-soft'
          }`}>
          {icon}
        </View>
        <View className="flex-1">
          <Text className="font-sans font-semibold text-foreground">{title}</Text>
          <Text className="font-sans text-sm text-muted-foreground">{description}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function OnboardingRole() {
  const router = useRouter();
  const colors = useThemeColors();
  const { role, setRole } = useOnboarding();

  const roles: { id: RoleType; icon: ReactNode; title: string; description: string }[] = [
    {
      id: 'parent',
      icon: <Baby size={24} color={role === 'parent' ? colors.primaryForeground : colors.primary} />,
      title: 'Parent of young child',
      description: 'Ages 0–5 years. Morning walks, playground visits, nap schedules.',
    },
    {
      id: 'pet',
      icon: <Dog size={24} color={role === 'pet' ? colors.primaryForeground : colors.primary} />,
      title: 'Pet parent',
      description: 'Daily walks, dog parks, pet-friendly hangouts.',
    },
    {
      id: 'both',
      icon: <Heart size={24} color={role === 'both' ? colors.primaryForeground : colors.primary} />,
      title: 'Both',
      description: "You've got your hands full! We'll match you with both communities.",
    },
  ];

  return (
    <Screen>
      <OnboardingProgress step={2} onBack={() => router.back()} />
      <ScrollView contentContainerClassName="flex-1 justify-center gap-6 p-6">
        <View className="gap-2">
          <Text className="text-center font-sans text-2xl font-bold text-foreground">
            What brings you here?
          </Text>
          <Text className="text-center font-sans text-base text-muted-foreground">
            This helps us match you with neighbors who share similar routines.
          </Text>
        </View>

        <View className="gap-4">
          {roles.map((r) => (
            <RoleCard
              key={r.id}
              icon={r.icon}
              title={r.title}
              description={r.description}
              selected={role === r.id}
              onPress={() => setRole(r.id)}
            />
          ))}
        </View>

        <Button label="Next" onPress={() => router.push('/onboarding/interests')} disabled={!role} />
      </ScrollView>
    </Screen>
  );
}
