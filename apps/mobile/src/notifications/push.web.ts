// Web preview: no push notifications, and expo-notifications isn't loaded at all.
// Same API as push.ts.

export type { PushData } from './push';

export function setOpenChat(_connectionId: string | null) {}

export function pushUnavailableReason(): string | null {
  return 'web preview';
}

export async function registerForPush(): Promise<string | null> {
  return null;
}

export async function unregisterPush(): Promise<void> {}
