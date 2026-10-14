import * as api from '@neighborhood-connect/api-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { unregisterPush } from '@/notifications/push';

import { AuthProvider, useAuth } from '../AuthContext';
import { clearSession, loadSession, saveSession } from '../session-storage';

jest.mock('@neighborhood-connect/api-client', () => {
  const actual = jest.requireActual('@neighborhood-connect/api-client');
  return {
    ApiError: actual.ApiError,
    configureApiClient: jest.fn(),
    setGetUserId: jest.fn(),
    devLogin: jest.fn(),
    getMe: jest.fn(),
    getMyProfile: jest.fn(),
  };
});
jest.mock('../session-storage', () => ({
  loadSession: jest.fn(),
  saveSession: jest.fn(),
  clearSession: jest.fn(),
}));
jest.mock('@/notifications/push', () => ({ unregisterPush: jest.fn() }));

const mocked = {
  devLogin: api.devLogin as jest.Mock,
  getMe: api.getMe as jest.Mock,
  getMyProfile: api.getMyProfile as jest.Mock,
  setGetUserId: api.setGetUserId as jest.Mock,
  loadSession: loadSession as jest.Mock,
  saveSession: saveSession as jest.Mock,
  clearSession: clearSession as jest.Mock,
  unregisterPush: unregisterPush as jest.Mock,
};

// Captured once, when AuthContext configures the client at import time
const clientConfig = (api.configureApiClient as jest.Mock).mock.calls[0][0] as { onUnauthorized: () => void };

let result: { current: ReturnType<typeof useAuth> };

async function renderAuth() {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
  ({ result } = await renderHook(() => useAuth(), { wrapper }));
}

const status = () => `${result.current.status}|${result.current.userId}|${result.current.hasProfile}`;
/** The user ID the API client would send as x-user-id right now. */
const currentHeaderUserId = () => (mocked.setGetUserId.mock.calls.at(-1)![0] as () => string | null)();

beforeEach(() => {
  jest.clearAllMocks();
  mocked.saveSession.mockResolvedValue(undefined);
  mocked.clearSession.mockResolvedValue(undefined);
  mocked.unregisterPush.mockResolvedValue(undefined);
});

describe('restoring the session on launch', () => {
  it('is signed out when nothing is stored', async () => {
    mocked.loadSession.mockResolvedValue(null);
    await renderAuth();
    await waitFor(() => expect(status()).toBe('signedOut|null|false'));
    expect(mocked.getMe).not.toHaveBeenCalled();
  });

  it('signs in and detects an existing profile', async () => {
    mocked.loadSession.mockResolvedValue({ userId: 'u1', email: 'a@b.c' });
    mocked.getMe.mockResolvedValue({ ok: true, user: { id: 'u1', email: 'a@b.c' } });
    mocked.getMyProfile.mockResolvedValue({ userId: 'u1' });
    await renderAuth();
    await waitFor(() => expect(status()).toBe('signedIn|u1|true'));
    expect(currentHeaderUserId()).toBe('u1');
  });

  it('treats a 404 profile as "needs onboarding"', async () => {
    mocked.loadSession.mockResolvedValue({ userId: 'u1', email: null });
    mocked.getMe.mockResolvedValue({ ok: true, user: { id: 'u1', email: null } });
    mocked.getMyProfile.mockRejectedValue(new api.ApiError(404, 'NOT_FOUND', 'Profile not found'));
    await renderAuth();
    await waitFor(() => expect(status()).toBe('signedIn|u1|false'));
  });

  it('signs out when the stored user no longer exists', async () => {
    mocked.loadSession.mockResolvedValue({ userId: 'gone', email: null });
    mocked.getMe.mockResolvedValue({ ok: true, user: null });
    await renderAuth();
    await waitFor(() => expect(status()).toBe('signedOut|null|false'));
    expect(mocked.clearSession).toHaveBeenCalled();
  });

  it('keeps the session and reports "unreachable" when the API is down', async () => {
    mocked.loadSession.mockResolvedValue({ userId: 'u1', email: null });
    mocked.getMe.mockRejectedValue(new api.ApiError(0, 'NETWORK_ERROR', 'offline'));
    await renderAuth();
    await waitFor(() => expect(status()).toBe('unreachable|u1|false'));
    expect(mocked.clearSession).not.toHaveBeenCalled();

    // Back online: retry recovers without signing in again
    mocked.getMe.mockResolvedValue({ ok: true, user: { id: 'u1', email: null } });
    mocked.getMyProfile.mockResolvedValue({ userId: 'u1' });
    await act(async () => result.current.retryRestore());
    await waitFor(() => expect(status()).toBe('signedIn|u1|true'));
  });
});

describe('signing in and out', () => {
  beforeEach(() => mocked.loadSession.mockResolvedValue(null));

  it('dev login saves the session and lands on onboarding for a new user', async () => {
    mocked.devLogin.mockResolvedValue({ userId: 'new', email: 'new@local.test' });
    mocked.getMyProfile.mockRejectedValue(new api.ApiError(404, 'NOT_FOUND', 'Profile not found'));
    await renderAuth();
    await waitFor(() => expect(status()).toBe('signedOut|null|false'));

    await act(async () => result.current.signIn('  new@local.test  '));
    expect(mocked.devLogin).toHaveBeenCalledWith('new@local.test');
    expect(mocked.saveSession).toHaveBeenCalledWith({ userId: 'new', email: 'new@local.test' });
    expect(status()).toBe('signedIn|new|false');

    await act(async () => result.current.markProfileComplete());
    expect(status()).toBe('signedIn|new|true');
  });

  it('a blank email asks the API for a new test user', async () => {
    mocked.devLogin.mockResolvedValue({ userId: 'x', email: null });
    mocked.getMyProfile.mockResolvedValue({});
    await renderAuth();
    await waitFor(() => expect(status()).toBe('signedOut|null|false'));
    await act(async () => result.current.signIn('   '));
    expect(mocked.devLogin).toHaveBeenCalledWith(undefined);
  });

  it('a failed sign-in stays signed out and saves nothing', async () => {
    mocked.devLogin.mockRejectedValue(new api.ApiError(0, 'NETWORK_ERROR', 'offline'));
    await renderAuth();
    await waitFor(() => expect(status()).toBe('signedOut|null|false'));
    await expect(act(async () => result.current.signIn('a@b.c'))).rejects.toThrow('offline');
    expect(mocked.saveSession).not.toHaveBeenCalled();
    expect(status()).toBe('signedOut|null|false');
  });

  it('sign out unregisters push while still signed in, then clears the session', async () => {
    mocked.devLogin.mockResolvedValue({ userId: 'u1', email: null });
    mocked.getMyProfile.mockResolvedValue({});
    await renderAuth();
    await waitFor(() => expect(status()).toBe('signedOut|null|false'));
    await act(async () => result.current.signIn('a@b.c'));

    let userIdDuringUnregister: string | null = null;
    mocked.unregisterPush.mockImplementation(async () => {
      userIdDuringUnregister = currentHeaderUserId();
    });
    await act(async () => result.current.signOut());

    expect(userIdDuringUnregister).toBe('u1');
    expect(mocked.clearSession).toHaveBeenCalled();
    expect(currentHeaderUserId()).toBeNull();
    expect(status()).toBe('signedOut|null|false');
  });

  it('a 401 from any API call signs the user out', async () => {
    mocked.devLogin.mockResolvedValue({ userId: 'u1', email: null });
    mocked.getMyProfile.mockResolvedValue({});
    await renderAuth();
    await waitFor(() => expect(status()).toBe('signedOut|null|false'));
    await act(async () => result.current.signIn('a@b.c'));
    expect(status()).toBe('signedIn|u1|true');

    await act(async () => clientConfig.onUnauthorized());
    await waitFor(() => expect(status()).toBe('signedOut|null|false'));
  });
});
