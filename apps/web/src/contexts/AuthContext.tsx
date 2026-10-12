import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import {
    configureApiClient,
    devLogin,
    getMe,
    getMyProfile,
    setGetUserId,
} from '@neighborhood-connect/api-client';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface AuthContextValue {
    /** The logged-in user's ID (null if not authenticated). */
    userId: string | null;
    /** The logged-in user's email. */
    email: string | null;
    /** Whether the auth state is still loading on mount. */
    isLoading: boolean;
    /** Whether the user is authenticated. */
    isAuthenticated: boolean;
    /** Whether the user has completed profile setup. */
    hasProfile: boolean | null;
    /** Log in via dev-login endpoint. */
    login: (email?: string) => Promise<void>;
    /** Log out and clear session. */
    logout: () => void;
    /** Mark that the current user has completed profile setup. */
    markProfileComplete: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ──────────────────────────────────────────────
// Storage keys
// ──────────────────────────────────────────────

const STORAGE_KEY_USER_ID = 'nc_user_id';
const STORAGE_KEY_EMAIL = 'nc_email';

// ──────────────────────────────────────────────
// API client setup
// ──────────────────────────────────────────────

configureApiClient({
    baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/v1',
    // 401 → clear the stored session and redirect to login
    onUnauthorized: () => {
        localStorage.removeItem(STORAGE_KEY_USER_ID);
        localStorage.removeItem(STORAGE_KEY_EMAIL);
        if (!window.location.pathname.startsWith('/dev-login')) {
            window.location.assign('/dev-login');
        }
    },
});

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    const [userId, setUserId] = useState<string | null>(
        () => localStorage.getItem(STORAGE_KEY_USER_ID),
    );
    const [email, setEmail] = useState<string | null>(
        () => localStorage.getItem(STORAGE_KEY_EMAIL),
    );
    const [isLoading, setIsLoading] = useState(true);
    const [hasProfile, setHasProfile] = useState<boolean | null>(null);

    // Wire the API client to always use the current userId
    useEffect(() => {
        setGetUserId(() => userId);
    }, [userId]);

    // On mount, validate the stored session
    useEffect(() => {
        async function validateSession() {
            const storedId = localStorage.getItem(STORAGE_KEY_USER_ID);
            if (!storedId) {
                setIsLoading(false);
                return;
            }

            try {
                // Temporarily set the userId so the API client can use it
                setGetUserId(() => storedId);
                const result = await getMe();
                if (result.ok && result.user) {
                    setUserId(result.user.id);
                    setEmail(result.user.email);
                    // Check if this user has a profile (try fetching, catch 404)
                    try {
                        await getMyProfile();
                        setHasProfile(true);
                    } catch {
                        setHasProfile(false);
                    }
                } else {
                    // Invalid session — clear
                    localStorage.removeItem(STORAGE_KEY_USER_ID);
                    localStorage.removeItem(STORAGE_KEY_EMAIL);
                    setUserId(null);
                    setEmail(null);
                }
            } catch {
                // API not reachable or session invalid
                localStorage.removeItem(STORAGE_KEY_USER_ID);
                localStorage.removeItem(STORAGE_KEY_EMAIL);
                setUserId(null);
                setEmail(null);
            } finally {
                setIsLoading(false);
            }
        }

        validateSession();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const login = useCallback(async (loginEmail?: string) => {
        const result = await devLogin(loginEmail);
        const id = result.userId;
        const resolvedEmail = result.email;

        localStorage.setItem(STORAGE_KEY_USER_ID, id);
        if (resolvedEmail) {
            localStorage.setItem(STORAGE_KEY_EMAIL, resolvedEmail);
        }

        setUserId(id);
        setEmail(resolvedEmail);

        // Check if the user has a profile
        try {
            setGetUserId(() => id);
            await getMyProfile();
            setHasProfile(true);
        } catch {
            setHasProfile(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY_USER_ID);
        localStorage.removeItem(STORAGE_KEY_EMAIL);
        setUserId(null);
        setEmail(null);
        setHasProfile(null);
    }, []);

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
            }}
        >
            {children}
        </AuthContext.Provider>
    );
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
