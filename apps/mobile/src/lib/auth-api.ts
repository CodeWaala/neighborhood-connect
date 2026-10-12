import { apiClient } from './api-client';

export interface AuthUser {
  userId: string;
  email: string | null;
}

export interface AuthMeResponse {
  ok: boolean;
  user?: {
    id: string;
    email: string | null;
    authProvider: string;
    createdAt: string;
    lastSeenAt: string | null;
  };
}

/** Dev-only login — creates or retrieves a user by email. */
export async function devLogin(email?: string): Promise<AuthUser> {
  return apiClient.post<AuthUser>('/auth/dev-login', { email });
}

/** Get the currently authenticated user. */
export async function getMe(): Promise<AuthMeResponse> {
  return apiClient.get<AuthMeResponse>('/auth/me');
}
