import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send, Shield } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { Avatar } from '@/components/Avatar';
import { Screen } from '@/components/Screen';
import { getConnection } from '@/lib/connections-api';
import { listMessages, sendMessage } from '@/lib/messages-api';
import { useThemeColors } from '@/lib/theme-colors';

function roleLabel(role: string) {
  if (role === 'pet') return 'Pet parent';
  if (role === 'both') return 'Parent & pet parent';
  return 'Parent';
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function Chat() {
  const colors = useThemeColors();
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const { id: connectionId } = useLocalSearchParams<{ id: string }>();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const { data: connection, isLoading: isLoadingConn } = useQuery({
    queryKey: ['connection', connectionId],
    queryFn: () => getConnection(connectionId),
    staleTime: 5 * 60 * 1000,
  });

  const { data: messages, isLoading: isLoadingMsgs } = useQuery({
    queryKey: ['messages', connectionId],
    queryFn: () => listMessages(connectionId),
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: (body: string) => sendMessage(connectionId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['messages', connectionId] });
      setDraft('');
    },
    onError: (error) => {
      Alert.alert('Failed to send message', error instanceof Error ? error.message : 'Please try again.');
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const isRequester = connection?.requesterId === userId;
  const other = isRequester ? connection?.recipient?.profile : connection?.requester?.profile;
  const contactName = other?.displayName ?? 'Neighbor';
  const contactRole = roleLabel(other?.role ?? 'parent');

  function handleSend() {
    const text = draft.trim();
    if (!text) return;
    sendMutation.mutate(text);
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <View className="flex-row items-center gap-3 border-b border-border px-4 py-3">
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
            <ArrowLeft size={20} color={colors.foreground} />
          </Pressable>
          {isLoadingConn ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <View className="flex-row items-center gap-3">
              <Avatar name={contactName} size={40} />
              <View>
                <Text className="font-sans font-semibold text-foreground">{contactName}</Text>
                <Text className="font-sans text-xs text-muted-foreground">{contactRole}</Text>
              </View>
            </View>
          )}
        </View>

        <View className="flex-row items-start gap-2 bg-primary-soft px-4 py-3">
          <Shield size={14} color={colors.primary} />
          <Text className="flex-1 font-sans text-xs text-muted-foreground">
            Keep conversations respectful. Meet in public places first and trust your instincts.
          </Text>
        </View>

        <ScrollView ref={scrollRef} contentContainerClassName="gap-4 p-4">
          {(isLoadingConn || isLoadingMsgs) && <ActivityIndicator color={colors.primary} />}

          {!isLoadingMsgs && messages?.length === 0 && (
            <Text className="pt-12 text-center font-sans text-sm text-muted-foreground">
              No messages yet. Say hello! 👋
            </Text>
          )}

          {messages?.map((message) => {
            const isMe = message.senderId === userId;
            return (
              <View key={message.id} className={`flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                <View
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    isMe ? 'bg-primary' : 'border border-border bg-card'
                  }`}>
                  <Text className={`font-sans text-sm ${isMe ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {message.body}
                  </Text>
                  <Text
                    className={`mt-1.5 font-sans text-[10px] ${
                      isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                    {formatTime(message.createdAt)}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View className="flex-row items-end gap-3 border-t border-border p-4">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message..."
            placeholderTextColor={colors.placeholder}
            multiline
            className="flex-1 rounded-2xl border border-border bg-card px-4 py-3 font-sans text-sm text-foreground"
            style={{ minHeight: 48, maxHeight: 120 }}
          />
          <Pressable
            onPress={handleSend}
            disabled={!draft.trim() || sendMutation.isPending}
            accessibilityRole="button"
            accessibilityLabel="Send"
            className="h-12 w-12 items-center justify-center rounded-full bg-primary"
            style={{ opacity: !draft.trim() || sendMutation.isPending ? 0.6 : 1 }}>
            {sendMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Send size={20} color="white" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
