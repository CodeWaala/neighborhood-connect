import { getProfileById, listMessages, type Connection } from '@neighborhood-connect/api-client';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Check, ChevronRight, Clock, Compass, Users } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Screen, ScreenTitle } from '@/components/Screen';
import { otherParty, useConnections, useRespondToRequest } from '@/hooks/useConnections';
import { useMyProfile } from '@/hooks/useMyProfile';
import {
  groupByWindow,
  joinDays,
  overlappingSlots,
  roleContext,
  sharedInterests,
  type AvailabilitySlot,
} from '@/lib/matching';
import { fonts, spacing, textStyles, useTheme } from '@/theme';

/** Connections tab: incoming requests, people you're connected with, and requests you've sent. */
export default function ConnectionsScreen() {
  const { colors } = useTheme();
  const { userId } = useAuth();
  const connections = useConnections();
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await connections.refetch();
    setRefreshing(false);
  }

  const all = connections.data ?? [];
  const requests = all.filter((c) => c.status === 'pending' && c.recipientId === userId);
  const connected = all.filter((c) => c.status === 'accepted');
  const sent = all.filter((c) => c.status === 'pending' && c.requesterId === userId);
  const isEmpty = requests.length + connected.length + sent.length === 0;

  return (
    <Screen edges={['top']}>
      <ScreenTitle title="Connections" />
      {connections.isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loading} />
      ) : connections.isError ? (
        <View style={styles.centered}>
          <Text style={[textStyles.body, styles.center, { color: colors.mutedForeground }]}>
            Couldn’t load your connections. Check your connection and try again.
          </Text>
          <Button label="Try again" variant="outline" size="md" onPress={() => void handleRefresh()} />
        </View>
      ) : isEmpty ? (
        <EmptyConnections />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void handleRefresh()}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {requests.length > 0 && (
            <Section title={`Requests (${requests.length})`}>
              {requests.map((c) => (
                <RequestCard key={c.id} connection={c} />
              ))}
            </Section>
          )}
          {connected.length > 0 && (
            <Section title={`Connected (${connected.length})`}>
              <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {connected.map((c, i) => (
                  <ConnectedRow key={c.id} connection={c} divider={i > 0} />
                ))}
              </View>
            </Section>
          )}
          {sent.length > 0 && (
            <Section title={`Sent (${sent.length})`}>
              <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {sent.map((c, i) => (
                  <SentRow key={c.id} connection={c} divider={i > 0} />
                ))}
              </View>
            </Section>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

// ──────────────────────────────────────────────
// Incoming request
// ──────────────────────────────────────────────

function RequestCard({ connection }: { connection: Connection }) {
  const { colors } = useTheme();
  const { userId: myUserId } = useAuth();
  const me = useMyProfile();
  const respond = useRespondToRequest();
  const other = otherParty(connection, myUserId);
  const name = other.profile?.displayName ?? 'Neighbor';

  // Their full profile, for the shared interest / time chips
  const theirProfile = useQuery({ queryKey: ['profile', other.userId], queryFn: () => getProfileById(other.userId) });
  const theirSlots: AvailabilitySlot[] = (theirProfile.data?.user?.availability ?? []).map((ua) => ({
    dayOfWeek: ua.dayOfWeek,
    window: ua.availabilityWindow,
  }));
  const chips = [
    ...sharedInterests(
      me.data?.interests ?? [],
      (theirProfile.data?.user?.interests ?? []).map((ui) => ui.interest),
    ).map((i) => i.label),
    ...groupByWindow(overlappingSlots(me.data?.slots ?? [], theirSlots)).map(
      (g) => `${joinDays(g.days)} ${g.window.label.toLowerCase()}s`,
    ),
  ];

  return (
    <View style={[styles.requestCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${name}, wants to connect. View profile`}
        onPress={() => router.push({ pathname: '/neighbor/[id]', params: { id: other.userId } })}
        style={styles.personRow}
      >
        <Avatar name={name} size={48} tone="accent" />
        <View style={styles.personText}>
          <Text style={[styles.personName, { color: colors.foreground }]}>{name}</Text>
          <Text style={[textStyles.label, styles.regular, { color: colors.mutedForeground }]}>
            {other.profile ? `${roleContext(other.profile.role)} · wants to connect` : 'Wants to connect'}
          </Text>
        </View>
      </Pressable>
      {chips.length > 0 && (
        <View style={styles.chips}>
          {chips.map((label) => (
            <Chip key={label} label={label} />
          ))}
        </View>
      )}
      {respond.isError && (
        <Text accessibilityRole="alert" style={[textStyles.label, { color: colors.danger }]}>
          Couldn’t update the request. Please try again.
        </Text>
      )}
      <View style={styles.actions}>
        <Button
          label="Decline"
          variant="outline"
          size="md"
          style={styles.flex}
          disabled={respond.isPending}
          onPress={() => respond.mutate({ connectionId: connection.id, status: 'declined' })}
        />
        <Button
          label="Accept"
          size="md"
          style={styles.flex}
          loading={respond.isPending}
          icon={<Check size={18} color={colors.onPrimary} strokeWidth={2.75} />}
          onPress={() => respond.mutate({ connectionId: connection.id, status: 'accepted' })}
        />
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────
// Connected / sent rows
// ──────────────────────────────────────────────

function ConnectedRow({ connection, divider }: { connection: Connection; divider: boolean }) {
  const { colors } = useTheme();
  const { userId: myUserId } = useAuth();
  const other = otherParty(connection, myUserId);
  const name = other.profile?.displayName ?? 'Neighbor';

  // Shares its cache with the open chat, so the preview stays current
  const messages = useQuery({ queryKey: ['messages', connection.id], queryFn: () => listMessages(connection.id) });
  const last = messages.data?.[messages.data.length - 1];
  const preview = last ? `${last.senderId === myUserId ? 'You: ' : ''}${last.body}` : 'Say hello and plan a meetup';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Chat with ${name}. ${preview}`}
      onPress={() => router.push({ pathname: '/chat/[id]', params: { id: connection.id } })}
      style={({ pressed }) => [
        styles.row,
        divider && { borderTopWidth: 1, borderTopColor: colors.border },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      <Avatar name={name} size={48} tone={last ? 'primary' : 'muted'} />
      <View style={styles.personText}>
        <Text style={[styles.personName, { color: colors.foreground }]}>{name}</Text>
        <Text numberOfLines={1} style={[textStyles.label, styles.regular, { color: colors.mutedForeground }]}>
          {preview}
        </Text>
      </View>
      <ChevronRight size={20} color={colors.placeholder} strokeWidth={2.25} />
    </Pressable>
  );
}

function SentRow({ connection, divider }: { connection: Connection; divider: boolean }) {
  const { colors } = useTheme();
  const { userId: myUserId } = useAuth();
  const other = otherParty(connection, myUserId);
  const name = other.profile?.displayName ?? 'Neighbor';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, waiting for response. View profile`}
      onPress={() => router.push({ pathname: '/neighbor/[id]', params: { id: other.userId } })}
      style={({ pressed }) => [
        styles.row,
        divider && { borderTopWidth: 1, borderTopColor: colors.border },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      <Avatar name={name} size={48} />
      <View style={styles.personText}>
        <Text style={[styles.personName, { color: colors.foreground }]}>{name}</Text>
        <View style={styles.waiting}>
          <Clock size={14} color={colors.mutedForeground} strokeWidth={2.25} />
          <Text style={[textStyles.label, styles.regular, { color: colors.mutedForeground }]}>
            Waiting for response
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function EmptyConnections() {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.primarySoft }]}>
        <Users size={44} color={colors.primary} strokeWidth={1.75} />
      </View>
      <Text accessibilityRole="header" style={[styles.emptyTitle, { color: colors.foreground }]}>
        No connections yet
      </Text>
      <Text style={[textStyles.body, styles.center, { color: colors.mutedForeground }]}>
        Discover neighbors to start connecting! Send requests to people who share your interests.
      </Text>
      <Button
        label="Discover Neighbors"
        style={styles.stretch}
        icon={<Compass size={18} color={colors.onPrimary} strokeWidth={2.25} />}
        onPress={() => router.navigate('/')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  stretch: {
    alignSelf: 'stretch',
  },
  regular: {
    fontFamily: fonts.regular,
  },
  loading: {
    marginTop: 60,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  center: {
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
    gap: spacing.xxl,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    marginHorizontal: spacing.xs,
    fontFamily: fonts.extrabold,
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  requestCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.lg,
    gap: 14,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  personText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  personName: {
    fontFamily: fonts.extrabold,
    fontSize: 17,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  group: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  row: {
    minHeight: 72,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  waiting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingHorizontal: 28,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 24,
    marginBottom: -spacing.sm,
  },
});
