import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Check,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  Shield,
} from 'lucide-react-native';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/auth/AuthContext';
import { listConnections, createConnection, updateConnection } from '@/lib/connections-api';
import { getProfileById } from '@/lib/profile-api';
import { useThemeColors } from '@/lib/theme-colors';

const DAY_LABELS: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

function roleLabel(role: string) {
  if (role === 'pet') return 'Pet parent';
  if (role === 'both') return 'Parent & pet parent';
  return 'Parent';
}

export default function NeighborProfile() {
  const colors = useThemeColors();
  const queryClient = useQueryClient();
  const { userId: myId } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => getProfileById(id),
    staleTime: 2 * 60 * 1000,
  });

  const { data: connections } = useQuery({
    queryKey: ['connections'],
    queryFn: listConnections,
    staleTime: 30_000,
  });

  const existing = connections?.find(
    (c) => (c.requesterId === myId && c.recipientId === id) || (c.recipientId === myId && c.requesterId === id),
  );
  const connStatus = existing?.status;
  const iAmRequester = existing?.requesterId === myId;

  const connectMutation = useMutation({
    mutationFn: () => createConnection(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['discovery'] });
      void queryClient.invalidateQueries({ queryKey: ['connections'] });
      router.push({ pathname: '/request-sent', params: { name: profile?.displayName ?? 'Neighbor' } });
    },
    onError: (error) => {
      Alert.alert('Failed to send request', error instanceof Error ? error.message : 'Please try again.');
    },
  });

  const acceptMutation = useMutation({
    mutationFn: () => updateConnection(existing!.id, 'accepted'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['connections'] });
      Alert.alert('Connection accepted! 🎉', 'You can now message each other.');
    },
    onError: (error) => {
      Alert.alert('Something went wrong', error instanceof Error ? error.message : 'Please try again.');
    },
  });

  if (isLoading) {
    return (
      <Screen>
        <Header title="" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (isError || !profile) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="font-sans text-muted-foreground">Profile not found</Text>
          <Button label="Back to Matches" variant="outline" onPress={() => router.replace('/discovery')} />
        </View>
      </Screen>
    );
  }

  const interests = profile.user?.interests?.map((ui) => ui.interest.label) ?? [];
  const availability = profile.user?.availability ?? [];
  const days = [...new Set(availability.map((a) => a.dayOfWeek))];
  const timeWindows = [...new Set(availability.map((a) => a.availabilityWindow.label))];

  return (
    <Screen>
      <Header title={`${profile.displayName}'s Profile`} />
      <ScrollView contentContainerClassName="gap-6 p-4">
        <View className="gap-4 rounded-2xl border border-border bg-card p-6">
          <View className="flex-row items-center gap-4">
            <Avatar name={profile.displayName} size={80} />
            <View className="flex-1 gap-1">
              <Text className="font-sans text-2xl font-bold text-foreground">{profile.displayName}</Text>
              <Text className="font-sans text-muted-foreground">{roleLabel(profile.role)}</Text>
              <View className="flex-row items-center gap-1.5">
                <MapPin size={14} color={colors.mutedForeground} />
                <Text className="font-sans text-sm text-muted-foreground">
                  {profile.neighborhood?.name ?? 'Unknown'} neighborhood
                </Text>
              </View>
            </View>
          </View>
        </View>

        {profile.bio && (
          <View className="gap-2 rounded-2xl border border-border bg-card p-6">
            <View className="flex-row items-center gap-2">
              <Heart size={18} color={colors.accent} />
              <Text className="font-sans text-lg font-semibold text-foreground">About me</Text>
            </View>
            <Text className="font-sans text-muted-foreground">{profile.bio}</Text>
          </View>
        )}

        {interests.length > 0 && (
          <View className="gap-3 rounded-2xl border border-border bg-card p-6">
            <Text className="font-sans text-lg font-semibold text-foreground">Interests</Text>
            <View className="flex-row flex-wrap gap-2">
              {interests.map((interest) => (
                <Chip key={interest} label={interest} selected />
              ))}
            </View>
          </View>
        )}

        {(days.length > 0 || timeWindows.length > 0) && (
          <View className="gap-4 rounded-2xl border border-border bg-card p-6">
            <View className="flex-row items-center gap-2">
              <Clock size={18} color={colors.primary} />
              <Text className="font-sans text-lg font-semibold text-foreground">Availability</Text>
            </View>
            {days.length > 0 && (
              <View className="gap-2">
                <Text className="font-sans text-sm font-medium text-muted-foreground">Days</Text>
                <View className="flex-row flex-wrap gap-2">
                  {days.map((day) => (
                    <View key={day} className="rounded-full bg-secondary px-3 py-1.5">
                      <Text className="font-sans text-sm font-medium text-secondary-foreground">
                        {DAY_LABELS[day] ?? day}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {timeWindows.length > 0 && (
              <View className="gap-2">
                <Text className="font-sans text-sm font-medium text-muted-foreground">Preferred time</Text>
                <View className="flex-row flex-wrap gap-2">
                  {timeWindows.map((time) => (
                    <View key={time} className="rounded-full bg-accent-soft px-3 py-1.5">
                      <Text className="font-sans text-sm font-medium text-accent">{time}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        <View className="flex-row items-start gap-3 rounded-2xl border border-primary bg-primary-soft p-5">
          <Shield size={20} color={colors.primary} />
          <View className="flex-1">
            <Text className="font-sans text-sm font-semibold text-foreground">Your privacy matters</Text>
            <Text className="font-sans text-sm text-muted-foreground">
              Exact locations are never shared. You&rsquo;ll only see neighborhood-level info
              until you both agree to connect.
            </Text>
          </View>
        </View>

        <View className="gap-3">
          {!connStatus && (
            <Button
              label="Send Connection Request"
              size="xl"
              loading={connectMutation.isPending}
              onPress={() => connectMutation.mutate()}
            />
          )}
          {connStatus === 'pending' && iAmRequester && (
            <Button
              label="Request Sent · Waiting for response"
              variant="outline"
              size="xl"
              disabled
              icon={<Clock size={16} color={colors.foreground} />}
              onPress={() => {}}
            />
          )}
          {connStatus === 'pending' && !iAmRequester && (
            <Button
              label="Accept Connection Request"
              size="xl"
              loading={acceptMutation.isPending}
              icon={<Check size={16} color="white" />}
              onPress={() => acceptMutation.mutate()}
            />
          )}
          {connStatus === 'accepted' && (
            <Button
              label={`Message ${profile.displayName}`}
              size="xl"
              icon={<MessageCircle size={16} color="white" />}
              onPress={() => router.push({ pathname: '/chat/[id]', params: { id: existing!.id } })}
            />
          )}
          <Button label="Back to Matches" variant="outline" size="lg" onPress={() => router.replace('/discovery')} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function Header({ title }: { title: string }) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
        <ArrowLeft size={20} color={colors.foreground} />
      </Pressable>
      <Text className="font-sans text-lg font-semibold text-foreground">{title}</Text>
    </View>
  );
}
