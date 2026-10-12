import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { registerDevice, type DevicePlatform } from './devices-api';

/**
 * Requests permission and registers this device's Expo push token with the
 * backend (ADR 0003). Silently no-ops if permission is denied or no EAS
 * projectId exists yet (ticket 009 sets that up) — getExpoPushTokenAsync
 * can't produce a token without one, and that's expected until then.
 */
export async function registerForPushNotifications(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    if (__DEV__) {
      console.warn('[push] No EAS projectId configured yet (ticket 009) — skipping token registration.');
    }
    return;
  }

  try {
    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
    const platform: DevicePlatform = Platform.OS === 'ios' ? 'ios' : 'android';
    await registerDevice(expoPushToken, platform);
  } catch (error) {
    if (__DEV__) {
      console.warn('[push] Failed to register for push notifications', error);
    }
  }
}
