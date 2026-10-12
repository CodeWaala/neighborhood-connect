import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ArrowLeft, Baby, Coffee, Dog, MessageCircle, Sparkles, Trees } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import type { Interest } from '@neighborhood-connect/types';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { useInvalidateMyProfile, useMyProfile } from '@/hooks/useMyProfile';
import { listInterests } from '@/lib/interests-api';
import { replaceInterests } from '@/lib/profile-api';
import { useThemeColors } from '@/lib/theme-colors';

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

function InterestsForm({ allInterests, initialIds }: { allInterests: Interest[]; initialIds: string[] }) {
  const colors = useThemeColors();
  const invalidate = useInvalidateMyProfile();
  const [selected, setSelected] = useState(initialIds);

  const save = useMutation({
    mutationFn: (ids: string[]) => replaceInterests(ids),
    onSuccess: () => {
      invalidate();
      router.back();
    },
    onError: (error) => {
      Alert.alert('Couldn’t save', error instanceof Error ? error.message : 'Please try again.');
    },
  });

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  return (
    <ScrollView contentContainerClassName="gap-6 p-4">
      <View className="flex-row flex-wrap gap-3">
        {allInterests.map((interest) => {
          const isSelected = selected.includes(interest.id);
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

      <Button label="Save" loading={save.isPending} disabled={selected.length === 0} onPress={() => save.mutate(selected)} />
    </ScrollView>
  );
}

export default function EditInterests() {
  const colors = useThemeColors();
  const me = useMyProfile();

  const { data: allInterests } = useQuery({
    queryKey: ['interests'],
    queryFn: listInterests,
    staleTime: 5 * 60 * 1000,
  });

  const isReady = !!me.data && !!allInterests;

  return (
    <Screen>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
          <ArrowLeft size={20} color={colors.foreground} />
        </Pressable>
        <Text className="font-sans text-lg font-semibold text-foreground">Interests</Text>
      </View>

      {isReady ? (
        <InterestsForm
          allInterests={allInterests}
          initialIds={me.data!.user?.interests.map((ui) => ui.interestId) ?? []}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
    </Screen>
  );
}
