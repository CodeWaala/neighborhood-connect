import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Heart, Share2, Users } from 'lucide-react-native';
import { ActivityIndicator, Alert, FlatList, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { MatchCard } from '@/components/MatchCard';
import { createConnection } from '@/lib/connections-api';
import { listMatches, type DiscoveryMatch } from '@/lib/discovery-api';
import { useThemeColors } from '@/lib/theme-colors';

function EmptyState() {
  const colors = useThemeColors();
  return (
    <View className="flex-1 items-center justify-center gap-6 p-6">
      <View className="h-24 w-24 items-center justify-center rounded-full bg-primary-soft">
        <Users size={40} color={colors.primary} />
      </View>
      <View className="gap-3">
        <Text className="text-center font-sans text-2xl font-bold text-foreground">
          Your community is growing
        </Text>
        <Text className="text-center font-sans text-base text-muted-foreground">
          We&rsquo;re still finding neighbors who match your interests and schedule. As more
          people join, you&rsquo;ll see great connections here.
        </Text>
      </View>
      <View className="gap-2 rounded-xl bg-accent-soft p-4">
        <View className="flex-row items-center justify-center gap-2">
          <Heart size={16} color={colors.primary} />
          <Text className="font-sans text-sm font-medium text-primary">Quality over quantity</Text>
        </View>
        <Text className="text-center font-sans text-xs text-muted-foreground">
          We only show you neighbors who truly share your interests and availability.
        </Text>
      </View>
      <Button
        label="Invite a Neighbor"
        icon={<Share2 size={16} color="white" />}
        onPress={() => Alert.alert('Invite link copied!', 'Share this with your neighbors.')}
        className="w-full"
      />
    </View>
  );
}

export default function Discovery() {
  const colors = useThemeColors();
  const queryClient = useQueryClient();

  const { data: matches, isLoading, isError } = useQuery({
    queryKey: ['discovery'],
    queryFn: () => listMatches(),
    staleTime: 2 * 60 * 1000,
  });

  const connectMutation = useMutation({
    mutationFn: (match: DiscoveryMatch) => createConnection(match.id),
    onSuccess: (_connection, match) => {
      void queryClient.invalidateQueries({ queryKey: ['discovery'] });
      void queryClient.invalidateQueries({ queryKey: ['connections'] });
      router.push({ pathname: '/request-sent', params: { name: match.profile?.displayName ?? 'Neighbor' } });
    },
    onError: (error) => {
      Alert.alert('Failed to send request', error instanceof Error ? error.message : 'Please try again.');
    },
  });

  const matchCount = matches?.length ?? 0;
  const isEmpty = !isLoading && matchCount === 0;

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="font-sans text-xl font-bold text-foreground">Discovery</Text>
        {matchCount > 0 && (
          <Text className="font-sans text-sm text-muted-foreground">{matchCount} matches nearby</Text>
        )}
      </View>

      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {isError && (
        <View className="mx-4 rounded-xl border border-destructive bg-card p-4">
          <Text className="text-center font-sans text-sm font-medium text-destructive">
            Failed to load matches. Please try refreshing.
          </Text>
        </View>
      )}

      {isEmpty && <EmptyState />}

      {!isLoading && matches && matches.length > 0 && (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-4 p-4"
          renderItem={({ item }) => (
            <MatchCard
              match={item}
              isConnecting={connectMutation.isPending && connectMutation.variables?.id === item.id}
              onConnect={() => connectMutation.mutate(item)}
              onViewProfile={() => router.push({ pathname: '/neighbor/[id]', params: { id: item.id } })}
            />
          )}
          ListFooterComponent={
            <Text className="pt-4 text-center font-sans text-sm text-muted-foreground">
              We show you a few great matches rather than endless options.{'\n'}New neighbors join
              weekly.
            </Text>
          }
        />
      )}
    </Screen>
  );
}
