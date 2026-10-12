import { apiClient } from './client';

// ──────────────────────────────────────────────
// API Functions
// ──────────────────────────────────────────────

export type DevicePlatform = 'ios' | 'android';

/** Register (or refresh) this device's Expo push token for the current user. */
export async function registerDevice(token: string, platform: DevicePlatform): Promise<void> {
    return apiClient.post<void>('/devices', { token, platform });
}

/** Forget this device's push token (call on sign-out, before clearing the session). */
export async function unregisterDevice(token: string): Promise<void> {
    return apiClient.delete<void>(`/devices/${encodeURIComponent(token)}`);
}
