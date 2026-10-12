import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Compass, MessageCircle } from 'lucide-react-native';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { listConnections, type Connection } from '@/lib/connections-api';
import { useThemeColors } from '@/lib/theme-colors';

function otherUser(conn: Connection, myId: string) {
  const isRequester = conn.requesterId === myId;
  const other = isRequester ? conn.recipient : conn.requester;
  return { name: other?.profile?.displayName ?? 'Neighbor', role: other?.profile?.role ?? 'parent' };
}

function roleLabel(role: string) {
  if (role === 'pet') return 'Pet parent';
  if (role === 'both') return 'Parent & pet parent';
  return 'Parent';
}

export default function Messages() {
  const colors = useThemeColors();
  const { userId } = useAuth();

  const { data: connections, isLoading, isError } = useQuery({
    queryKey: ['connections'],
    queryFn: listConnections,
    staleTime: 30_000,
  });

  const threads = (connections ?? []).filter((c) => c.status === 'accepted');

  return (
    <Screen>
      <View className="px-4 py-3">
        <Text className="font-sans text-xl font-bold text-foreground">Messages</Text>
      </View>

      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {isError && (
        <View className="mx-4 rounded-xl border border-destructive bg-card p-4">
          <Text className="text-center font-sans text-sm font-medium text-destructive">
            Failed to load messages. Please try refreshing.
          </Text>
        </View>
      )}

      {!isLoading && threads.length === 0 && (
        <View className="flex-1 items-center justify-center gap-4 p-6">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-soft">
            <MessageCircle size={32} color={colors.primary} />
          </View>
          <Text className="text-center font-sans text-xl font-bold text-foreground">No conversations yet</Text>
          <Text className="text-center font-sans text-base text-muted-foreground">
            Messaging unlocks once you and a neighbor accept a connection.
          </Text>
          <Button
            label="Discover Neighbors"
            icon={<Compass size={16} color="white" />}
            className="w-full"
            onPress={() => router.replace('/discovery')}
          />
        </View>
      )}

      {threads.length > 0 && (
        <FlatList
          data={threads}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 p-4"
          renderItem={({ item }) => {
            const other = otherUser(item, userId!);
            return (
              <Pressable
                onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.id } })}
                className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <Avatar name={other.name} size={48} />
                <View className="flex-1">
                  <Text className="font-sans font-semibold text-foreground">{other.name}</Text>
                  <Text className="font-sans text-sm text-muted-foreground">{roleLabel(other.role)}</Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </Screen>
  );
}
