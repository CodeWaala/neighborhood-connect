import { getProfileById } from '@neighborhood-connect/api-client';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronLeft, Clock, Lock } from 'lucide-react-native';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { otherParty, useConnections, useRespondToRequest } from '@/hooks/useConnections';
import { useMyProfile } from '@/hooks/useMyProfile';
import { sendRequestErrorMessage, useSendRequest } from '@/hooks/useSendRequest';
import {
  dayShort,
  groupByWindow,
  overlapSentence,
  overlappingSlots,
  roleContext,
  sharedInterests,
  type AvailabilitySlot,
} from '@/lib/matching';
import { formatTimeRange } from '@/onboarding/format';
import { fonts, hitSize, spacing, textStyles, useTheme } from '@/theme';

const WEEK = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

/** A neighbor's profile: about, interests (shared ones filled), availability, and the connect action. */
export default function NeighborScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const me = useMyProfile();
  const profile = useQuery({ queryKey: ['profile', id], queryFn: () => getProfileById(id) });

  const data = profile.data;
  const name = data?.displayName ?? 'Neighbor';

  const theirInterests = (data?.user?.interests ?? []).map((ui) => ui.interest);
  const theirSlots: AvailabilitySlot[] = (data?.user?.availability ?? []).map((ua) => ({
    dayOfWeek: ua.dayOfWeek,
    window: ua.availabilityWindow,
  }));
  const sharedIds = new Set(sharedInterests(me.data?.interests ?? [], theirInterests).map((i) => i.id));
  const overlap = overlappingSlots(me.data?.slots ?? [], theirSlots);
  const overlapDays = new Set(overlap.map((s) => s.dayOfWeek));
  const theirDays = new Set(theirSlots.map((s) => s.dayOfWeek));
  const context = data
    ? [roleContext(data.role), data.children?.[0]?.ageRange].filter(Boolean).join(' · ')
    : '';

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.back}
        >
          <ChevronLeft size={24} color={colors.primary} strokeWidth={2.25} />
          <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
        </Pressable>
      </View>

      {profile.isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loading} />
      ) : profile.isError || !data ? (
        <View style={styles.centered}>
          <Text style={[textStyles.body, styles.center, { color: colors.mutedForeground }]}>
            This profile isn’t available right now.
          </Text>
          <Button label="Try again" variant="outline" size="md" onPress={() => void profile.refetch()} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.identity}>
              <Avatar name={name} size={88} />
              <Text accessibilityRole="header" style={[styles.name, { color: colors.foreground }]}>
                {name}
              </Text>
              <View style={styles.chipsCentered}>
                {context.length > 0 && <Chip label={context} variant="muted" />}
                {data.neighborhood && <Chip label={data.neighborhood.name} variant="muted" />}
              </View>
            </View>

            <Section title="About me">
              <Text style={[textStyles.body, { color: data.bio ? colors.foreground : colors.mutedForeground }]}>
                {data.bio || `${name} hasn’t written a bio yet.`}
              </Text>
            </Section>

            <Section title="Interests">
              <View style={styles.chips}>
                {theirInterests.map((i) => (
                  <Chip key={i.id} label={i.label} size="md" variant={sharedIds.has(i.id) ? 'filled' : 'outline'} />
                ))}
              </View>
              {sharedIds.size > 0 && (
                <Text style={[textStyles.label, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
                  Filled = shared with you
                </Text>
              )}
            </Section>

            <Section title="Availability">
              <View style={styles.week}>
                {WEEK.map((day) => {
                  const both = overlapDays.has(day);
                  const theirs = theirDays.has(day);
                  return (
                    <View
                      key={day}
                      accessible
                      accessibilityLabel={`${dayShort(day)}: ${both ? 'free, overlaps with you' : theirs ? 'free' : 'not available'}`}
                      style={[
                        styles.dayPill,
                        { backgroundColor: both ? colors.primary : theirs ? colors.primarySoft : colors.muted },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          {
                            color: both ? colors.onPrimary : theirs ? colors.onPrimarySoft : colors.placeholder,
                            fontFamily: both ? fonts.extrabold : fonts.bold,
                          },
                        ]}
                      >
                        {dayShort(day)[0]}
                      </Text>
                    </View>
                  );
                })}
              </View>
              {groupByWindow(theirSlots).map(({ window }) => (
                <View key={window.id} style={styles.windowRow}>
                  <Clock size={16} color={colors.mutedForeground} strokeWidth={2.25} />
                  <Text style={[textStyles.label, { color: colors.foreground, fontFamily: fonts.regular }]}>
                    {window.label}s, {formatTimeRange(window.timeRange)}
                  </Text>
                </View>
              ))}
              {overlap.length > 0 && (
                <Text style={[textStyles.label, { color: colors.onPrimarySoft, fontFamily: fonts.bold }]}>
                  {overlapSentence(overlap)}
                </Text>
              )}
            </Section>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
            <ConnectFooter userId={id} name={name} />
          </View>
        </>
      )}
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.foreground }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

/** Footer action that depends on any existing connection with this neighbor. */
function ConnectFooter({ userId, name }: { userId: string; name: string }) {
  const { colors } = useTheme();
  const { userId: myUserId } = useAuth();
  const connections = useConnections();
  const sendRequest = useSendRequest();
  const respond = useRespondToRequest();

  const connection = connections.data?.find((c) => otherParty(c, myUserId).userId === userId);
  const iAmRequester = connection ? otherParty(connection, myUserId).iAmRequester : false;

  if (connections.isLoading) {
    return <ActivityIndicator color={colors.primary} />;
  }

  if (connection?.status === 'accepted') {
    return (
      <>
        <Note icon={<Check size={16} color={colors.primary} strokeWidth={2.5} />}>You’re connected with {name}.</Note>
        <Button
          label={`Message ${name}`}
          onPress={() => router.push({ pathname: '/chat/[id]', params: { id: connection.id } })}
        />
      </>
    );
  }

  if (connection?.status === 'pending' && iAmRequester) {
    return (
      <Note icon={<Clock size={16} color={colors.primary} strokeWidth={2.25} />}>
        Request sent. Waiting for {name} to respond.
      </Note>
    );
  }

  if (connection?.status === 'pending') {
    return (
      <>
        <Note icon={<Lock size={16} color={colors.primary} strokeWidth={2.25} />}>
          {name} wants to connect. Accept to start messaging.
        </Note>
        {respond.isError && (
          <Text accessibilityRole="alert" style={[textStyles.label, { color: colors.danger }]}>
            Couldn’t update the request. Please try again.
          </Text>
        )}
        <View style={styles.row}>
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
            onPress={() => respond.mutate({ connectionId: connection.id, status: 'accepted' })}
          />
        </View>
      </>
    );
  }

  if (connection) {
    // Declined or blocked: the API allows only one request between two people
    return <Note>You can’t send {name} a request right now.</Note>;
  }

  return (
    <>
      <Note icon={<Lock size={16} color={colors.primary} strokeWidth={2.25} />}>
        Messaging unlocks only after {name} accepts.
      </Note>
      {sendRequest.isError && (
        <Text accessibilityRole="alert" style={[textStyles.label, { color: colors.danger }]}>
          {sendRequestErrorMessage(sendRequest.error)}
        </Text>
      )}
      <Button
        label="Send connection request"
        loading={sendRequest.isPending}
        onPress={() => sendRequest.mutate({ userId, name })}
      />
    </>
  );
}

function Note({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.note}>
      {icon}
      <Text style={[styles.noteText, { color: colors.mutedForeground }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  back: {
    height: hitSize,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.sm,
  },
  backText: {
    fontFamily: fonts.semibold,
    fontSize: 17,
  },
  loading: {
    marginTop: 80,
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
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  identity: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    fontFamily: fonts.extrabold,
    fontSize: 26,
    marginTop: spacing.xs,
  },
  chipsCentered: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 15,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  week: {
    flexDirection: 'row',
    gap: 6,
  },
  dayPill: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 13,
  },
  windowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: 10,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  noteText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
});
