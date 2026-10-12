/**
 * API Client — typed HTTP wrapper for the NestJS backend.
 *
 * Mirrors apps/web/src/api/client.ts. Uses the `x-user-id` header for dev
 * authentication; will switch to `Authorization: Bearer <jwt>` once the
 * Mobile Auth Client (ADR 0002) is wired — see docs/wayfinder ticket 001's
 * resolution for why dev-login is still in use.
 *
 * On a physical device, `localhost` resolves to the phone, not your dev
 * machine — set EXPO_PUBLIC_API_URL to your machine's LAN IP in apps/mobile/.env.
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/v1';

let getUserId: (() => string | null) | null = null;
let onUnauthorized: (() => void) | null = null;

export function setGetUserId(fn: () => string | null) {
  getUserId = fn;
}

export function setOnUnauthorized(fn: () => void) {
  onUnauthorized = fn;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export class ApiError extends Error {
  public status: number;
  public code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let code = 'UNKNOWN_ERROR';
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      if (body?.error) {
        code = body.error.code ?? code;
        message = body.error.message ?? body.message ?? message;
      } else if (body?.message) {
        message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
      }
    } catch {
      message = response.statusText || message;
    }

    if (response.status === 401) {
      onUnauthorized?.();
    }

    throw new ApiError(response.status, code, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

async function safeFetch(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Unable to reach the server. Please check your connection.');
  }
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const userId = getUserId?.();
  if (userId) {
    headers['x-user-id'] = userId;
  }

  return headers;
}

export const apiClient = {
  async get<T>(path: string): Promise<T> {
    const response = await safeFetch(`${API_BASE_URL}${path}`, {
      method: 'GET',
      headers: buildHeaders(),
    });
    return handleResponse<T>(response);
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const response = await safeFetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const response = await safeFetch(`${API_BASE_URL}${path}`, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async put<T>(path: string, body?: unknown): Promise<T> {
    const response = await safeFetch(`${API_BASE_URL}${path}`, {
      method: 'PUT',
      headers: buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },
};
