import * as SecureStore from 'expo-secure-store';

// ──────────────────────────────────────────────
// Stored session (device keychain / keystore)
// ──────────────────────────────────────────────

const KEY_USER_ID = 'nc_user_id';
const KEY_EMAIL = 'nc_email';

export interface StoredSession {
  userId: string;
  email: string | null;
}

export async function loadSession(): Promise<StoredSession | null> {
  const userId = await SecureStore.getItemAsync(KEY_USER_ID);
  if (!userId) return null;
  const email = await SecureStore.getItemAsync(KEY_EMAIL);
  return { userId, email };
}

export async function saveSession(session: StoredSession): Promise<void> {
  await SecureStore.setItemAsync(KEY_USER_ID, session.userId);
  if (session.email) {
    await SecureStore.setItemAsync(KEY_EMAIL, session.email);
  } else {
    await SecureStore.deleteItemAsync(KEY_EMAIL);
  }
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_USER_ID);
  await SecureStore.deleteItemAsync(KEY_EMAIL);
}
