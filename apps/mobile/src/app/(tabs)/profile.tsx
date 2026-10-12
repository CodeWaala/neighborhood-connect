import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, type Href } from 'expo-router';
import { ChevronRight, LogOut } from 'lucide-react-native';
import { ActivityIndicator, Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { MY_PROFILE_KEY, useMyProfile } from '@/hooks/useMyProfile';
import { updateProfile } from '@/lib/profile-api';
import { useThemeColors } from '@/lib/theme-colors';

function roleLabel(role: string) {
  if (role === 'pet') return 'Pet parent';
  if (role === 'both') return 'Parent & pet parent';
  return 'Parent';
}

function groupAvailability(slots: { dayOfWeek: string; availabilityWindow: { label: string } }[]): string {
  if (slots.length === 0) return 'Add your free times';
  const windowLabels = [...new Set(slots.map((s) => s.availabilityWindow.label))];
  return `${slots.length} time${slots.length === 1 ? '' : 's'} · ${windowLabels.join(', ')}`;
}

export default function Profile() {
  const colors = useThemeColors();
  const { logout } = useAuth();
  const me = useMyProfile();
  const queryClient = useQueryClient();

  const toggleVisibility = useMutation({
    mutationFn: (isProfilePublic: boolean) => updateProfile({ isProfilePublic }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: MY_PROFILE_KEY }),
    onError: (error) => {
      Alert.alert('Couldn’t update', error instanceof Error ? error.message : 'Please try again.');
    },
  });

  if (me.isLoading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!me.data) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center gap-4 p-6">
          <Text className="font-sans text-muted-foreground">Couldn&rsquo;t load your profile.</Text>
          <Button label="Try again" variant="outline" onPress={() => void me.refetch()} />
        </View>
      </Screen>
    );
  }

  const profile = me.data;
  const interests = profile.user?.interests ?? [];
  const availability = profile.user?.availability ?? [];

  const rows: { label: string; value: string; href: Href }[] = [
    { label: 'I am a...', value: roleLabel(profile.role), href: '/edit/role' },
    {
      label: 'Interests',
      value: interests.map((i) => i.interest.label).join(', ') || 'Pick your interests',
      href: '/edit/interests',
    },
    { label: 'Availability', value: groupAvailability(availability), href: '/edit/availability' },
    { label: 'About me', value: profile.bio || 'Add a short bio', href: '/edit/about' },
  ];

  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-6 p-4">
        <Text className="font-sans text-xl font-bold text-foreground">Profile</Text>

        <View className="flex-row items-center gap-4">
          <Avatar name={profile.displayName} size={64} />
          <View className="flex-1">
            <Text className="font-sans text-lg font-semibold text-foreground">{profile.displayName}</Text>
            {profile.neighborhood && (
              <Text className="font-sans text-sm text-muted-foreground">{profile.neighborhood.name}</Text>
            )}
          </View>
        </View>

        <View className="gap-2">
          <Text className="font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Your routines
          </Text>
          <View className="overflow-hidden rounded-2xl border border-border bg-card">
            {rows.map((row, i) => (
              <Pressable
                key={row.label}
                onPress={() => router.push(row.href)}
                className={`flex-row items-center justify-between p-4 ${i > 0 ? 'border-t border-border' : ''}`}>
                <View className="flex-1 pr-3">
                  <Text className="font-sans font-medium text-foreground">{row.label}</Text>
                  <Text numberOfLines={1} className="font-sans text-sm text-muted-foreground">
                    {row.value}
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </View>
        </View>

        <View className="gap-2">
          <Text className="font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Privacy
          </Text>
          <View className="flex-row items-center justify-between rounded-2xl border border-border bg-card p-4">
            <View className="flex-1 pr-3">
              <Text className="font-sans font-medium text-foreground">Show me in matches</Text>
              <Text className="font-sans text-sm text-muted-foreground">
                {profile.isProfilePublic
                  ? 'Only neighbors who match you can see your profile.'
                  : 'You’re hidden from Discover. Existing connections can still message you.'}
              </Text>
            </View>
            <Switch
              value={profile.isProfilePublic}
              onValueChange={(next) => toggleVisibility.mutate(next)}
              disabled={toggleVisibility.isPending}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="white"
            />
          </View>
        </View>

        <Button
          label="Sign out"
          variant="outline"
          icon={<LogOut size={16} color={colors.destructive} />}
          onPress={() => void logout()}
        />
      </ScrollView>
    </Screen>
  );
}
