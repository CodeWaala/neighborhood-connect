import {
  ApiError,
  configureApiClient,
  devLogin,
  getMe,
  getMyProfile,
  setGetUserId,
} from '@neighborhood-connect/api-client';
import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { API_URL } from '@/config';

import { clearSession, loadSession, saveSession, type StoredSession } from './session-storage';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

/**
 * - `restoring`   — reading the stored session on launch
 * - `signedOut`   — no session
 * - `signedIn`    — session valid; `hasProfile` says whether onboarding is done
 * - `unreachable` — a stored session exists but the API couldn't be reached to check it
 */
export type AuthStatus = 'restoring' | 'signedOut' | 'signedIn' | 'unreachable';

interface AuthState {
  status: AuthStatus;
  userId: string | null;
  email: string | null;
  hasProfile: boolean;
}

interface AuthContextValue extends AuthState {
  /** Dev login: creates or retrieves a user by email (blank → new test user). */
  signIn: (email?: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Call when onboarding creates the profile. */
  markProfileComplete: () => void;
  /** Re-check the stored session after `unreachable`. */
  retryRestore: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SIGNED_OUT: AuthState = { status: 'signedOut', userId: null, email: null, hasProfile: false };

// ──────────────────────────────────────────────
// API client setup
// ──────────────────────────────────────────────

/** Set by the provider; lets the API client sign the user out on a 401. */
let handleUnauthorized: () => void = () => {};

configureApiClient({
  baseUrl: API_URL,
  onUnauthorized: () => handleUnauthorized(),
});

/** True if the user has a profile; false on 404. Other errors propagate. */
async function fetchHasProfile(): Promise<boolean> {
  try {
    await getMyProfile();
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return false;
    throw error;
  }
}

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({ ...SIGNED_OUT, status: 'restoring' });

  // The API client reads the user ID through this ref, so it is always current
  const userIdRef = useRef<string | null>(null);
  useEffect(() => {
    setGetUserId(() => userIdRef.current);
  }, []);

  const signOut = useCallback(async () => {
    userIdRef.current = null;
    await clearSession();
    queryClient.clear();
    setState(SIGNED_OUT);
  }, [queryClient]);

  useEffect(() => {
    handleUnauthorized = () => void signOut();
  }, [signOut]);

  /** Validate a stored session against the API and decide where the user lands. */
  const validateSession = useCallback(
    async (stored: StoredSession | null) => {
      if (!stored) {
        setState(SIGNED_OUT);
        return;
      }

      userIdRef.current = stored.userId;
      try {
        const me = await getMe();
        if (!me.ok || !me.user) {
          await signOut();
          return;
        }
        const hasProfile = await fetchHasProfile();
        setState({ status: 'signedIn', userId: me.user.id, email: me.user.email, hasProfile });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return; // onUnauthorized already signed out
        }
        // Offline or server down: keep the stored session and let the user retry
        setState({ status: 'unreachable', userId: stored.userId, email: stored.email, hasProfile: false });
      }
    },
    [signOut],
  );

  // On launch, restore the session from secure storage
  useEffect(() => {
    loadSession().then(validateSession, () => setState(SIGNED_OUT));
  }, [validateSession]);

  const signIn = useCallback(async (email?: string) => {
    const user = await devLogin(email?.trim() || undefined);
    userIdRef.current = user.userId;
    try {
      const hasProfile = await fetchHasProfile();
      await saveSession({ userId: user.userId, email: user.email });
      setState({ status: 'signedIn', userId: user.userId, email: user.email, hasProfile });
    } catch (error) {
      userIdRef.current = null;
      throw error;
    }
  }, []);

  const markProfileComplete = useCallback(() => {
    setState((s) => ({ ...s, hasProfile: true }));
  }, []);

  const retryRestore = useCallback(() => {
    setState((s) => ({ ...s, status: 'restoring' }));
    loadSession().then(validateSession, () => setState(SIGNED_OUT));
  }, [validateSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, signIn, signOut, markProfileComplete, retryRestore }),
    [state, signIn, signOut, markProfileComplete, retryRestore],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
