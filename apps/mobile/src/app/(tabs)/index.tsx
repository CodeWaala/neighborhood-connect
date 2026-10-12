import { listMatches, type DiscoveryMatch } from '@neighborhood-connect/api-client';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Clock, Heart, MapPin, Share as ShareIcon, Users } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, RefreshControl, Share, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Screen, ScreenTitle } from '@/components/Screen';
import { Skeleton } from '@/components/Skeleton';
import { useMyProfile } from '@/hooks/useMyProfile';
import { sendRequestErrorMessage, useSendRequest } from '@/hooks/useSendRequest';
import {
  overlapSentence,
  overlappingSlots,
  roleContext,
  sharedInterests,
  type AvailabilitySlot,
  type InterestRef,
} from '@/lib/matching';
import { fonts, radius, spacing, textStyles, useTheme } from '@/theme';

const INVITE_MESSAGE =
  'I’m using NearbyPals to find parents and pet parents nearby for walks, park visits and coffee. Join me!';

/** Discover tab: curated matches (no infinite scroll), pull to refresh. */
export default function DiscoverScreen() {
  const { colors } = useTheme();
  const me = useMyProfile();
  const matches = useQuery({ queryKey: ['discovery'], queryFn: () => listMatches() });
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([matches.refetch(), me.refetch()]);
    setRefreshing(false);
  }

  const neighborhoodName = me.data?.profile.neighborhood?.name;
  const count = matches.data?.length ?? 0;
  const isLoading = matches.isLoading || me.isLoading;
  const isError = matches.isError || me.isError;

  const header = (
    <View style={styles.header}>
      <ScreenTitle
        title="Your matches"
        right={
          neighborhoodName ? (
            <View
              accessible
              accessibilityLabel={`Neighborhood: ${neighborhoodName}`}
              style={[styles.hoodPill, { backgroundColor: colors.primarySoft }]}
            >
              <MapPin size={14} color={colors.onPrimarySoft} strokeWidth={2.25} />
              <Text numberOfLines={1} style={[styles.hoodText, { color: colors.onPrimarySoft }]}>
                {neighborhoodName}
              </Text>
            </View>
          ) : undefined
        }
      />
      {count > 0 && (
        <Text style={[textStyles.bodySmall, styles.subtitle, { color: colors.mutedForeground }]}>
          {count === 1 ? '1 neighbor who shares' : `${count} neighbors who share`} your interests and schedule. Quality
          over quantity.
        </Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <Screen edges={['top']}>
        <View style={styles.header}>
          <ScreenTitle title="Your matches" />
          <Text style={[textStyles.bodySmall, styles.subtitle, { color: colors.mutedForeground }]}>
            Finding neighbors who share your interests and schedule…
          </Text>
        </View>
        <View accessibilityLabel="Loading matches" style={styles.list}>
          {[0, 1, 2].map((i) => (
            <MatchCardSkeleton key={i} />
          ))}
        </View>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen edges={['top']}>
        {header}
        <View style={styles.centered}>
          <Text style={[textStyles.body, styles.centerText, { color: colors.mutedForeground }]}>
            Couldn’t load your matches. Check your connection and try again.
          </Text>
          <Button label="Try again" variant="outline" size="md" onPress={() => void handleRefresh()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top']}>
      <FlatList
        data={matches.data ?? []}
        keyExtractor={(m) => m.id}
        ListHeaderComponent={header}
        ListEmptyComponent={<EmptyMatches />}
        contentContainerStyle={[styles.listContent, count === 0 && styles.flexGrow]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void handleRefresh()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <MatchCard match={item} myInterests={me.data?.interests ?? []} mySlots={me.data?.slots ?? []} />
        )}
      />
    </Screen>
  );
}

// ──────────────────────────────────────────────
// Match card
// ──────────────────────────────────────────────

function MatchCard({
  match,
  myInterests,
  mySlots,
}: {
  match: DiscoveryMatch;
  myInterests: InterestRef[];
  mySlots: AvailabilitySlot[];
}) {
  const { colors } = useTheme();
  const sendRequest = useSendRequest();
  const name = match.profile?.displayName ?? 'Neighbor';

  const shared = sharedInterests(
    myInterests,
    match.interests.map((i) => i.interest),
  );
  const overlap = overlapSentence(
    overlappingSlots(
      mySlots,
      match.availability.map((a) => ({ dayOfWeek: a.dayOfWeek, window: a.availabilityWindow })),
    ),
  );

  return (
    <View
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.foreground }]}
    >
      <View style={styles.cardHeader}>
        <Avatar name={name} />
        <View style={styles.cardTitle}>
          <Text accessibilityRole="header" style={[styles.name, { color: colors.foreground }]}>
            {name}
          </Text>
          {match.profile && (
            <Text style={[textStyles.label, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
              {roleContext(match.profile.role)}
            </Text>
          )}
        </View>
      </View>

      {shared.length > 0 && (
        <View style={styles.chips} accessibilityLabel={`Shared interests: ${shared.map((i) => i.label).join(', ')}`}>
          {shared.map((i) => (
            <Chip key={i.id} label={i.label} />
          ))}
        </View>
      )}

      {overlap && (
        <View style={[styles.overlap, { backgroundColor: colors.accentSoft }]}>
          <Clock size={16} color={colors.onAccentSoft} strokeWidth={2.25} />
          <Text style={[styles.overlapText, { color: colors.onAccentSoft }]}>{overlap}</Text>
        </View>
      )}

      {sendRequest.isError && (
        <Text accessibilityRole="alert" style={[textStyles.label, { color: colors.danger }]}>
          {sendRequestErrorMessage(sendRequest.error)}
        </Text>
      )}

      <View style={styles.actions}>
        <Button
          label="View profile"
          variant="outline"
          size="md"
          style={styles.flex}
          onPress={() => router.push({ pathname: '/neighbor/[id]', params: { id: match.id } })}
        />
        <Button
          label="Connect"
          size="md"
          style={styles.flex}
          loading={sendRequest.isPending}
          onPress={() => sendRequest.mutate({ userId: match.id, name })}
        />
      </View>
    </View>
  );
}

function MatchCardSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <Skeleton width={52} height={52} radius={26} />
        <View style={styles.skeletonLines}>
          <Skeleton width={96} height={16} />
          <Skeleton width={150} height={12} radius={6} />
        </View>
      </View>
      <View style={styles.chips}>
        <Skeleton width={112} height={30} radius={15} />
        <Skeleton width={104} height={30} radius={15} />
      </View>
      <Skeleton height={40} radius={12} />
      <View style={styles.actions}>
        <Skeleton height={48} radius={14} style={styles.flex} />
        <Skeleton height={48} radius={14} style={styles.flex} />
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────
// Empty state
// ──────────────────────────────────────────────

function EmptyMatches() {
  const { colors } = useTheme();

  return (
    <View style={styles.empty}>
      <View style={styles.emptyBody}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.primarySoft }]}>
          <Users size={48} color={colors.primary} strokeWidth={1.75} />
        </View>
        <Text accessibilityRole="header" style={[styles.emptyTitle, { color: colors.foreground }]}>
          Your community is growing
        </Text>
        <Text style={[textStyles.body, styles.centerText, { color: colors.mutedForeground }]}>
          We’re still finding neighbors who match your interests and schedule. As more people join, you’ll see great
          connections here.
        </Text>
        <View style={[styles.quality, { backgroundColor: colors.accentSoft }]}>
          <View style={styles.qualityTitleRow}>
            <Heart size={16} color={colors.onAccentSoft} strokeWidth={2.25} />
            <Text style={[styles.qualityTitle, { color: colors.onAccentSoft }]}>Quality over quantity</Text>
          </View>
          <Text style={[textStyles.label, styles.centerText, { color: colors.onAccentSoft, fontFamily: fonts.regular }]}>
            We only show you neighbors who truly share your interests and availability. Good things take time.
          </Text>
        </View>
      </View>
      <View style={styles.emptyActions}>
        <Button
          label="Invite a Neighbor"
          icon={<ShareIcon size={18} color={colors.onPrimary} strokeWidth={2.25} />}
          onPress={() => void Share.share({ message: INVITE_MESSAGE })}
        />
        <Text style={[textStyles.label, styles.centerText, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
          Pull down to check for new matches.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  flexGrow: {
    flexGrow: 1,
  },
  header: {
    paddingBottom: spacing.sm,
  },
  subtitle: {
    paddingHorizontal: spacing.xl,
    marginTop: -6,
  },
  hoodPill: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 30,
    paddingHorizontal: 12,
    borderRadius: radius.chip,
  },
  hoodText: {
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: 14,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  separator: {
    height: 14,
  },
  card: {
    marginHorizontal: spacing.lg,
    padding: 18,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: 14,
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardTitle: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: fonts.extrabold,
    fontSize: 18,
  },
  skeletonLines: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  overlap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.banner,
  },
  overlapText: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  centerText: {
    textAlign: 'center',
  },
  empty: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
  },
  emptyBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...textStyles.title,
    fontSize: 26,
    lineHeight: 31,
    textAlign: 'center',
  },
  quality: {
    alignSelf: 'stretch',
    padding: 14,
    borderRadius: 16,
    gap: 4,
  },
  qualityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  qualityTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 15,
  },
  emptyActions: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
});
