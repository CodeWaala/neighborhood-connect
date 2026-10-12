import type { StoredSession } from './session-storage';

// ──────────────────────────────────────────────
// Web fallback for `expo start --web` (dev preview only).
// expo-secure-store has no web implementation; phones use session-storage.ts.
// ──────────────────────────────────────────────

const KEY_USER_ID = 'nc_user_id';
const KEY_EMAIL = 'nc_email';

export type { StoredSession };

export async function loadSession(): Promise<StoredSession | null> {
  const userId = localStorage.getItem(KEY_USER_ID);
  if (!userId) return null;
  return { userId, email: localStorage.getItem(KEY_EMAIL) };
}

export async function saveSession(session: StoredSession): Promise<void> {
  localStorage.setItem(KEY_USER_ID, session.userId);
  if (session.email) {
    localStorage.setItem(KEY_EMAIL, session.email);
  } else {
    localStorage.removeItem(KEY_EMAIL);
  }
}

export async function clearSession(): Promise<void> {
  localStorage.removeItem(KEY_USER_ID);
  localStorage.removeItem(KEY_EMAIL);
}
