import {
  getConnection,
  getProfileById,
  listMessages,
  sendMessage,
  type Message,
} from '@neighborhood-connect/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, MessageCircle, Send } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { otherParty } from '@/hooks/useConnections';
import { useMyProfile } from '@/hooks/useMyProfile';
import { overlappingSlots, roleContext, sharedInterests, sharedSummary, type AvailabilitySlot } from '@/lib/matching';
import { setOpenChat } from '@/notifications/push';
import { fonts, hitSize, radius, spacing, textStyles, useTheme } from '@/theme';

/** Fallback refresh while the chat is open; an incoming message push also triggers a refetch. */
const POLL_INTERVAL_MS = 10_000;
const MAX_MESSAGE_LENGTH = 1000;

/** One-to-one, text-only chat for an accepted connection. No reactions, no read receipts. */
export default function ChatScreen() {
  const { id: connectionId } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { userId: myUserId } = useAuth();
  const queryClient = useQueryClient();
  const me = useMyProfile();

  const connection = useQuery({ queryKey: ['connection', connectionId], queryFn: () => getConnection(connectionId) });
  const other = connection.data ? otherParty(connection.data, myUserId) : null;
  const name = other?.profile?.displayName ?? 'Neighbor';

  const theirProfile = useQuery({
    queryKey: ['profile', other?.userId],
    queryFn: () => getProfileById(other!.userId),
    enabled: !!other,
  });

  const messages = useQuery({
    queryKey: ['messages', connectionId],
    queryFn: () => listMessages(connectionId),
    refetchInterval: POLL_INTERVAL_MS,
    enabled: connection.data?.status === 'accepted',
  });

  // Message pushes for this chat refresh it silently instead of showing a banner
  useEffect(() => {
    setOpenChat(connectionId);
    return () => setOpenChat(null);
  }, [connectionId]);

  const [draft, setDraft] = useState('');
  const send = useMutation({
    mutationFn: (body: string) => sendMessage(connectionId, body),
    onSuccess: (message) => {
      queryClient.setQueryData<Message[]>(['messages', connectionId], (prev = []) =>
        prev.some((m) => m.id === message.id) ? prev : [...prev, message],
      );
    },
    onError: (_error, body) => setDraft((current) => current || body),
  });

  function handleSend() {
    const body = draft.trim();
    if (!body || send.isPending) return;
    setDraft('');
    send.mutate(body);
  }

  // "You both enjoy … and are free …"
  const theirSlots: AvailabilitySlot[] = (theirProfile.data?.user?.availability ?? []).map((ua) => ({
    dayOfWeek: ua.dayOfWeek,
    window: ua.availabilityWindow,
  }));
  const shared = sharedInterests(
    me.data?.interests ?? [],
    (theirProfile.data?.user?.interests ?? []).map((ui) => ui.interest),
  );
  const overlap = overlappingSlots(me.data?.slots ?? [], theirSlots);

  const list = messages.data ?? [];
  const notAccepted = connection.data && connection.data.status !== 'accepted';

  return (
    <Screen>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to connections"
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.back}
        >
          <ChevronLeft size={24} color={colors.primary} strokeWidth={2.25} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${name}. View profile`}
          disabled={!other}
          onPress={() => other && router.push({ pathname: '/neighbor/[id]', params: { id: other.userId } })}
          style={styles.headerPerson}
        >
          <Avatar name={name} size={40} tone={list.length > 0 ? 'primary' : 'muted'} />
          <View style={styles.flex}>
            <Text accessibilityRole="header" style={[styles.headerName, { color: colors.foreground }]}>
              {name}
            </Text>
            {other?.profile && (
              <Text style={[styles.headerRole, { color: colors.mutedForeground }]}>{roleContext(other.profile.role)}</Text>
            )}
          </View>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {connection.isLoading || messages.isLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.loading} />
        ) : connection.isError || notAccepted ? (
          <View style={styles.centered}>
            <Text style={[textStyles.body, styles.center, { color: colors.mutedForeground }]}>
              {notAccepted ? 'Messaging opens once your request is accepted.' : 'Couldn’t open this chat.'}
            </Text>
            <Button label="Back" variant="outline" size="md" onPress={() => router.back()} />
          </View>
        ) : list.length === 0 ? (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primarySoft }]}>
              <MessageCircle size={36} color={colors.primary} strokeWidth={1.9} />
            </View>
            <Text accessibilityRole="header" style={[styles.emptyTitle, { color: colors.foreground }]}>
              No messages yet. Say hello!
            </Text>
            {(shared.length > 0 || overlap.length > 0) && (
              <Text style={[textStyles.bodySmall, styles.center, { color: colors.mutedForeground }]}>
                {sharedSummary(shared, overlap, `You and ${name} both`)}
              </Text>
            )}
          </View>
        ) : (
          <FlatList
            // Inverted so the newest message sits at the bottom and the list opens there
            inverted
            data={[...list].reverse()}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.messages}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={
              shared.length > 0 || overlap.length > 0 ? (
                <View style={[styles.banner, { backgroundColor: colors.primarySoft }]}>
                  <Text style={[styles.bannerText, { color: colors.onPrimarySoft }]}>
                    {sharedSummary(shared, overlap)}
                  </Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => <Bubble message={item} mine={item.senderId === myUserId} />}
          />
        )}

        {connection.data?.status === 'accepted' && (
          <View style={[styles.composer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
            {send.isError && (
              <Text accessibilityRole="alert" style={[textStyles.label, styles.sendError, { color: colors.danger }]}>
                Message not sent. Check your connection and try again.
              </Text>
            )}
            <View style={styles.composerRow}>
              <TextInput
                accessibilityLabel="Message"
                value={draft}
                onChangeText={setDraft}
                placeholder="Type a message..."
                placeholderTextColor={colors.placeholder}
                multiline
                // Start at one line; it grows up to maxHeight as the message gets longer
                numberOfLines={1}
                maxLength={MAX_MESSAGE_LENGTH}
                style={[
                  styles.input,
                  { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground },
                ]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Send"
                accessibilityState={{ disabled: !draft.trim() || send.isPending }}
                disabled={!draft.trim() || send.isPending}
                onPress={handleSend}
                style={[styles.sendButton, { backgroundColor: colors.primary }, !draft.trim() && styles.dimmed]}
              >
                {send.isPending ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <Send size={20} color={colors.onPrimary} strokeWidth={2.25} />
                )}
              </Pressable>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Bubble({ message, mine }: { message: Message; mine: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.bubble,
        mine
          ? [styles.mine, { backgroundColor: colors.primary }]
          : [styles.theirs, { backgroundColor: colors.card, borderColor: colors.border }],
      ]}
    >
      <Text style={[styles.bubbleText, { color: mine ? colors.onPrimary : colors.foreground }]}>{message.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  back: {
    width: hitSize,
    height: hitSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerPerson: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerName: {
    fontFamily: fonts.extrabold,
    fontSize: 17,
  },
  headerRole: {
    fontFamily: fonts.regular,
    fontSize: 13,
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
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 22,
    textAlign: 'center',
  },
  messages: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  banner: {
    alignSelf: 'center',
    maxWidth: 300,
    marginBottom: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.button,
  },
  bannerText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    textAlign: 'center',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  mine: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
  },
  theirs: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderBottomLeftRadius: 6,
  },
  bubbleText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
  },
  composer: {
    borderTopWidth: 1,
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 6,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  sendError: {
    paddingHorizontal: spacing.xs,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderWidth: 1.5,
    borderRadius: 23,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimmed: {
    opacity: 0.5,
  },
});
