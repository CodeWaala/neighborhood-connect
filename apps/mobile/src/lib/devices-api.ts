import { apiClient } from './api-client';

export type DevicePlatform = 'ios' | 'android';

/** Registers (or re-registers, if the device changed owners) this device's Expo push token. */
export async function registerDevice(token: string, platform: DevicePlatform): Promise<void> {
  await apiClient.post('/devices', { token, platform });
}
