import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { devLogin, getMe } from '@/lib/auth-api';
import { setGetUserId, setOnUnauthorized } from '@/lib/api-client';
import { getMyProfile } from '@/lib/profile-api';

import { clearSession, loadSession, saveSession } from './session-storage';

interface AuthContextValue {
  userId: string | null;
  email: string | null;
  /** Still resolving the stored session on launch. */
  isLoading: boolean;
  isAuthenticated: boolean;
  /** null while still resolving; true/false once known. */
  hasProfile: boolean | null;
  login: (email?: string) => Promise<void>;
  logout: () => Promise<void>;
  markProfileComplete: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    setGetUserId(() => userId);
  }, [userId]);

  const clear = useCallback(async () => {
    await clearSession();
    setUserId(null);
    setEmail(null);
    setHasProfile(null);
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      void clear();
    });
  }, [clear]);

  // On mount, validate the stored session against the API.
  useEffect(() => {
    async function validateSession() {
      const stored = await loadSession();
      if (!stored) {
        setIsLoading(false);
        return;
      }

      try {
        setGetUserId(() => stored.userId);
        const result = await getMe();
        if (result.ok && result.user) {
          setUserId(result.user.id);
          setEmail(result.user.email);
          try {
            await getMyProfile();
            setHasProfile(true);
          } catch {
            setHasProfile(false);
          }
        } else {
          await clear();
        }
      } catch {
        await clear();
      } finally {
        setIsLoading(false);
      }
    }

    void validateSession();
  }, [clear]);

  const login = useCallback(async (loginEmail?: string) => {
    const result = await devLogin(loginEmail);
    await saveSession({ userId: result.userId, email: result.email });

    setUserId(result.userId);
    setEmail(result.email);
    setGetUserId(() => result.userId);

    try {
      await getMyProfile();
      setHasProfile(true);
    } catch {
      setHasProfile(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await clear();
  }, [clear]);

  const markProfileComplete = useCallback(() => {
    setHasProfile(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userId,
        email,
        isLoading,
        isAuthenticated: !!userId,
        hasProfile,
        login,
        logout,
        markProfileComplete,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
