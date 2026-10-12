import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useInvalidateMyProfile, useMyProfile } from '@/hooks/useMyProfile';
import { updateProfile } from '@/lib/profile-api';
import { useThemeColors } from '@/lib/theme-colors';

const MAX_LENGTH = 300;

function AboutForm({ initialBio }: { initialBio: string }) {
  const colors = useThemeColors();
  const invalidate = useInvalidateMyProfile();
  const [bio, setBio] = useState(initialBio);

  const save = useMutation({
    mutationFn: (next: string) => updateProfile({ bio: next }),
    onSuccess: () => {
      invalidate();
      router.back();
    },
    onError: (error) => {
      Alert.alert('Couldn’t save', error instanceof Error ? error.message : 'Please try again.');
    },
  });

  return (
    <ScrollView contentContainerClassName="gap-3 p-4">
      <TextInput
        value={bio}
        onChangeText={(text) => setBio(text.slice(0, MAX_LENGTH))}
        placeholder="Tell neighbors a bit about yourself..."
        placeholderTextColor={colors.placeholder}
        multiline
        className="rounded-xl border border-border bg-card p-4 font-sans text-base text-foreground"
        style={{ minHeight: 120 }}
      />
      <Text className="text-right font-sans text-xs text-muted-foreground">
        {bio.length}/{MAX_LENGTH} characters
      </Text>
      <Button label="Save" loading={save.isPending} onPress={() => save.mutate(bio)} />
    </ScrollView>
  );
}

export default function EditAbout() {
  const colors = useThemeColors();
  const me = useMyProfile();

  return (
    <Screen>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
          <ArrowLeft size={20} color={colors.foreground} />
        </Pressable>
        <Text className="font-sans text-lg font-semibold text-foreground">About me</Text>
      </View>

      {me.data ? (
        <AboutForm initialBio={me.data.bio ?? ''} />
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
    </Screen>
  );
}
