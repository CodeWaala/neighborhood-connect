import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Check, Clock, Compass, MessageCircle, Users, X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { listConnections, updateConnection, type Connection, type ConnectionStatus } from '@/lib/connections-api';
import { useThemeColors } from '@/lib/theme-colors';

function otherUser(conn: Connection, myId: string) {
  const isRequester = conn.requesterId === myId;
  const other = isRequester ? conn.recipient : conn.requester;
  return {
    id: isRequester ? conn.recipientId : conn.requesterId,
    name: other?.profile?.displayName ?? 'Neighbor',
    role: other?.profile?.role ?? 'parent',
  };
}

function roleLabel(role: string) {
  if (role === 'pet') return 'Pet parent';
  if (role === 'both') return 'Parent & pet parent';
  return 'Parent';
}

function timeAgo(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </Text>
      {children}
    </View>
  );
}

export default function Connections() {
  const colors = useThemeColors();
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const { data: connections, isLoading, isError } = useQuery({
    queryKey: ['connections'],
    queryFn: listConnections,
    staleTime: 30_000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ConnectionStatus }) => updateConnection(id, status),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['connections'] });
      if (variables.status === 'accepted') {
        Alert.alert('Connection accepted! 🎉', 'You can now message each other.');
      }
    },
    onError: (error) => {
      Alert.alert('Something went wrong', error instanceof Error ? error.message : 'Please try again.');
    },
  });

  if (isLoading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  const all = connections ?? [];
  const received = all.filter((c) => c.status === 'pending' && c.recipientId === userId);
  const sent = all.filter((c) => c.status === 'pending' && c.requesterId === userId);
  const accepted = all.filter((c) => c.status === 'accepted');
  const isEmpty = received.length + sent.length + accepted.length === 0;

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="font-sans text-xl font-bold text-primary">Connections</Text>
        {received.length > 0 && (
          <View className="rounded-full bg-primary px-2.5 py-1">
            <Text className="font-sans text-xs font-bold text-primary-foreground">{received.length} new</Text>
          </View>
        )}
      </View>

      {isError && (
        <View className="mx-4 rounded-xl border border-destructive bg-card p-4">
          <Text className="text-center font-sans text-sm font-medium text-destructive">
            Failed to load connections. Please try refreshing.
          </Text>
        </View>
      )}

      {isEmpty ? (
        <View className="flex-1 items-center justify-center gap-4 p-6">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-soft">
            <Users size={32} color={colors.primary} />
          </View>
          <Text className="text-center font-sans text-xl font-bold text-foreground">No connections yet</Text>
          <Text className="text-center font-sans text-base text-muted-foreground">
            Discover neighbors to start connecting! Send requests to people who share your
            interests.
          </Text>
          <Button
            label="Discover Neighbors"
            icon={<Compass size={16} color="white" />}
            className="w-full"
            onPress={() => router.replace('/discovery')}
          />
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-8 p-4">
          {received.length > 0 && (
            <Section title={`Pending Requests (${received.length})`}>
              {received.map((conn) => {
                const other = otherUser(conn, userId!);
                return (
                  <View key={conn.id} className="gap-3 rounded-2xl border border-border bg-card p-5">
                    <View className="flex-row items-center gap-3">
                      <Avatar name={other.name} size={48} />
                      <View className="flex-1">
                        <Text className="font-sans font-semibold text-foreground">{other.name}</Text>
                        <Text className="font-sans text-sm text-muted-foreground">{roleLabel(other.role)}</Text>
                      </View>
                      <Text className="font-sans text-xs text-muted-foreground">{timeAgo(conn.requestedAt)}</Text>
                    </View>
                    <View className="flex-row gap-3">
                      <Button
                        label="Accept"
                        size="sm"
                        className="flex-1"
                        icon={<Check size={16} color="white" />}
                        loading={updateMutation.isPending}
                        onPress={() => updateMutation.mutate({ id: conn.id, status: 'accepted' })}
                      />
                      <Button
                        label="Decline"
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        icon={<X size={16} color={colors.foreground} />}
                        disabled={updateMutation.isPending}
                        onPress={() => updateMutation.mutate({ id: conn.id, status: 'declined' })}
                      />
                    </View>
                  </View>
                );
              })}
            </Section>
          )}

          {sent.length > 0 && (
            <Section title={`Sent (${sent.length})`}>
              {sent.map((conn) => {
                const other = otherUser(conn, userId!);
                return (
                  <View key={conn.id} className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-5 opacity-80">
                    <Avatar name={other.name} size={48} />
                    <View className="flex-1">
                      <Text className="font-sans font-semibold text-foreground">{other.name}</Text>
                      <View className="flex-row items-center gap-1.5">
                        <Clock size={14} color={colors.mutedForeground} />
                        <Text className="font-sans text-sm text-muted-foreground">Waiting for response</Text>
                      </View>
                    </View>
                    <Text className="font-sans text-xs text-muted-foreground">{timeAgo(conn.requestedAt)}</Text>
                  </View>
                );
              })}
            </Section>
          )}

          {accepted.length > 0 && (
            <Section title={`Active Connections (${accepted.length})`}>
              {accepted.map((conn) => {
                const other = otherUser(conn, userId!);
                return (
                  <View key={conn.id} className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-5">
                    <Avatar name={other.name} size={48} />
                    <View className="flex-1">
                      <Text className="font-sans font-semibold text-foreground">{other.name}</Text>
                      <Text className="font-sans text-sm text-muted-foreground">{roleLabel(other.role)}</Text>
                    </View>
                    <Button
                      label="Message"
                      size="sm"
                      icon={<MessageCircle size={16} color="white" />}
                      onPress={() => router.push({ pathname: '/chat/[id]', params: { id: conn.id } })}
                    />
                  </View>
                );
              })}
            </Section>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}
