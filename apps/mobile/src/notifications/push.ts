import { registerDevice, unregisterDevice } from '@neighborhood-connect/api-client';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ──────────────────────────────────────────────
// Push notifications: permission, token registration, foreground behavior.
// Remote push needs a development or production build on a real device;
// in Expo Go, simulators and the web preview everything here is a no-op.
// ──────────────────────────────────────────────

/** Mirrors the API's push `data`. */
export type PushData =
  | { type: 'connection_request'; connectionId: string }
  | { type: 'connection_accepted'; connectionId: string }
  | { type: 'message'; connectionId: string };

const KEY_PUSH_TOKEN = 'nc_push_token';

/** The chat currently on screen, so its own message pushes don't also show a banner. */
let openChatId: string | null = null;

export function setOpenChat(connectionId: string | null) {
  openChatId = connectionId;
}

export function parsePushData(data: unknown): PushData | null {
  if (!data || typeof data !== 'object') return null;
  const { type, connectionId } = data as Record<string, unknown>;
  if (typeof connectionId !== 'string') return null;
  if (type === 'connection_request' || type === 'connection_accepted' || type === 'message') {
    return { type, connectionId };
  }
  return null;
}

// Foreground: show the banner, except for a message in the chat that's already open
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = parsePushData(notification.request.content.data);
    const inOpenChat = data?.type === 'message' && data.connectionId === openChatId;
    return {
      shouldShowBanner: !inOpenChat,
      shouldShowList: true,
      shouldPlaySound: !inOpenChat,
      shouldSetBadge: false,
    };
  },
});

function projectId(): string | undefined {
  return Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
}

/** Why push can't work here, or null when it can. */
export function pushUnavailableReason(): string | null {
  if (Platform.OS === 'web') return 'web preview';
  if (!Device.isDevice) return 'simulator';
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return 'Expo Go';
  if (!projectId()) return 'no EAS project ID (run `eas init`)';
  return null;
}

/**
 * Ask for permission if it hasn't been decided yet, then register this device's Expo push token
 * with the API. Safe to call on every launch: an already-granted permission just refreshes the token.
 * Returns the token, or null when push isn't available or permission was denied.
 */
export async function registerForPush(): Promise<string | null> {
  const unavailable = pushUnavailableReason();
  if (unavailable) {
    if (__DEV__) console.log(`[push] skipped: ${unavailable}`);
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Requests and messages',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  let { status, canAskAgain } = await Notifications.getPermissionsAsync();
  if (status !== 'granted' && canAskAgain) {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== 'granted') return null;

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId: projectId() });
  await registerDevice(token, Platform.OS === 'ios' ? 'ios' : 'android');
  await SecureStore.setItemAsync(KEY_PUSH_TOKEN, token);
  return token;
}

/** On sign-out: tell the API to stop pushing to this device. Never throws. */
export async function unregisterPush(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const token = await SecureStore.getItemAsync(KEY_PUSH_TOKEN);
    if (!token) return;
    await unregisterDevice(token);
    await SecureStore.deleteItemAsync(KEY_PUSH_TOKEN);
  } catch {
    // Offline: the token stays on the server until the next user signs in on this
    // device (registering moves it to them) or Expo reports it as unregistered
  }
}
