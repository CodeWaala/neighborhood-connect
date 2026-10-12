import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/auth/AuthContext';

import { parsePushData, registerForPush, type PushData } from './push';

/** Users this app session already registered a token for (survives tab remounts). */
const registeredUsers = new Set<string>();
/** Notification taps already acted on, so a remount doesn't navigate twice. */
const handledResponses = new Set<string>();

function openFor(data: PushData) {
  if (data.type === 'connection_request') {
    router.navigate('/connections');
  } else {
    // Accepted request or new message: open that chat
    router.push({ pathname: '/chat/[id]', params: { id: data.connectionId } });
  }
}

/**
 * Push setup for signed-in users with a profile (mounted by the tabs layout, i.e. after onboarding):
 * registers the device, refreshes data when a push arrives, and routes notification taps.
 */
export function usePushNotifications() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  // Ask for permission / register the token once per user per app session
  useEffect(() => {
    if (!userId || registeredUsers.has(userId)) return;
    registeredUsers.add(userId);
    registerForPush().catch((error) => {
      registeredUsers.delete(userId);
      if (__DEV__) console.warn('[push] registration failed', error);
    });
  }, [userId]);

  // A push arrived while the app is open: refresh what it's about
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const data = parsePushData(notification.request.content.data);
      if (!data) return;
      if (data.type === 'message') {
        void queryClient.invalidateQueries({ queryKey: ['messages', data.connectionId] });
      }
      void queryClient.invalidateQueries({ queryKey: ['connections'] });
      if (data.type !== 'message') {
        void queryClient.invalidateQueries({ queryKey: ['discovery'] });
      }
    });
    return () => subscription.remove();
  }, [queryClient]);

  // Tapped a notification (also covers a tap that launched the app)
  const response = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (!response) return;
    const id = response.notification.request.identifier;
    if (handledResponses.has(id)) return;
    handledResponses.add(id);
    const data = parsePushData(response.notification.request.content.data);
    if (data) openFor(data);
  }, [response]);
}
