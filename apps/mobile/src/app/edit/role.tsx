import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ArrowLeft, Baby, Dog, Heart } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import type { ProfileRole } from '@neighborhood-connect/types';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useInvalidateMyProfile, useMyProfile } from '@/hooks/useMyProfile';
import { updateProfile } from '@/lib/profile-api';
import { useThemeColors } from '@/lib/theme-colors';

export default function EditRole() {
  const colors = useThemeColors();
  const me = useMyProfile();
  const invalidate = useInvalidateMyProfile();
  const [role, setRole] = useState<ProfileRole | null>(null);
  const currentRole = role ?? me.data?.role ?? null;

  const save = useMutation({
    mutationFn: (next: ProfileRole) => updateProfile({ role: next }),
    onSuccess: () => {
      invalidate();
      router.back();
    },
    onError: (error) => {
      Alert.alert('Couldn’t save', error instanceof Error ? error.message : 'Please try again.');
    },
  });

  const options: { id: ProfileRole; icon: ReactNode; title: string; description: string }[] = [
    {
      id: 'parent',
      icon: <Baby size={24} color={currentRole === 'parent' ? colors.primaryForeground : colors.primary} />,
      title: 'Parent of young child',
      description: 'Ages 0–5 years.',
    },
    {
      id: 'pet',
      icon: <Dog size={24} color={currentRole === 'pet' ? colors.primaryForeground : colors.primary} />,
      title: 'Pet parent',
      description: 'Daily walks, dog parks.',
    },
    {
      id: 'both',
      icon: <Heart size={24} color={currentRole === 'both' ? colors.primaryForeground : colors.primary} />,
      title: 'Both',
      description: 'Match with both communities.',
    },
  ];

  if (me.isLoading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
          <ArrowLeft size={20} color={colors.foreground} />
        </Pressable>
        <Text className="font-sans text-lg font-semibold text-foreground">I am a...</Text>
      </View>

      <ScrollView contentContainerClassName="gap-4 p-4">
        {options.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => setRole(option.id)}
            className={`rounded-2xl border-2 p-5 ${
              currentRole === option.id ? 'border-primary bg-primary-soft' : 'border-border bg-card'
            }`}>
            <View className="flex-row items-start gap-4">
              <View
                className={`h-12 w-12 items-center justify-center rounded-full ${
                  currentRole === option.id ? 'bg-primary' : 'bg-primary-soft'
                }`}>
                {option.icon}
              </View>
              <View className="flex-1">
                <Text className="font-sans font-semibold text-foreground">{option.title}</Text>
                <Text className="font-sans text-sm text-muted-foreground">{option.description}</Text>
              </View>
            </View>
          </Pressable>
        ))}

        <Button
          label="Save"
          loading={save.isPending}
          disabled={!currentRole}
          onPress={() => currentRole && save.mutate(currentRole)}
        />
      </ScrollView>
    </Screen>
  );
}
