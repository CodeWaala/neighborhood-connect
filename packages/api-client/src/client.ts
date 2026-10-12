/**
 * API Client — typed HTTP wrapper for the NestJS backend.
 *
 * Shared by the web and mobile apps. Each app calls `configureApiClient` once at
 * startup to supply the base URL and what to do on a 401; nothing here reads
 * platform globals (`import.meta.env`, `localStorage`, `window`).
 *
 * Uses the `x-user-id` header for dev authentication.
 * Will switch to `Authorization: Bearer <jwt>` when Cognito is wired.
 */

export interface ApiClientConfig {
    /** Base URL including the version prefix, e.g. `http://localhost:3000/v1`. */
    baseUrl: string;
    /** Called after any 401 response, before the error is thrown. */
    onUnauthorized?: () => void;
}

let config: ApiClientConfig = { baseUrl: 'http://localhost:3000/v1' };

export function configureApiClient(next: Partial<ApiClientConfig>) {
    config = { ...config, ...next };
}

/** Stored getter — set by the app's auth provider so the client can attach the user ID header. */
let getUserId: (() => string | null) | null = null;

export function setGetUserId(fn: () => string | null) {
    getUserId = fn;
}

/** Standard API error shape returned by the backend. */
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
            // Response body wasn't JSON — use status text
            message = response.statusText || message;
        }

        if (response.status === 401) {
            config.onUnauthorized?.();
        }

        throw new ApiError(response.status, code, message);
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

/** Wrapper to catch network errors (offline, DNS failures, etc.). */
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
        const response = await safeFetch(`${config.baseUrl}${path}`, {
            method: 'GET',
            headers: buildHeaders(),
        });
        return handleResponse<T>(response);
    },

    async post<T>(path: string, body?: unknown): Promise<T> {
        const response = await safeFetch(`${config.baseUrl}${path}`, {
            method: 'POST',
            headers: buildHeaders(),
            body: body ? JSON.stringify(body) : undefined,
        });
        return handleResponse<T>(response);
    },

    async patch<T>(path: string, body?: unknown): Promise<T> {
        const response = await safeFetch(`${config.baseUrl}${path}`, {
            method: 'PATCH',
            headers: buildHeaders(),
            body: body ? JSON.stringify(body) : undefined,
        });
        return handleResponse<T>(response);
    },

    async put<T>(path: string, body?: unknown): Promise<T> {
        const response = await safeFetch(`${config.baseUrl}${path}`, {
            method: 'PUT',
            headers: buildHeaders(),
            body: body ? JSON.stringify(body) : undefined,
        });
        return handleResponse<T>(response);
    },

    async delete<T>(path: string): Promise<T> {
        const response = await safeFetch(`${config.baseUrl}${path}`, {
            method: 'DELETE',
            headers: buildHeaders(),
        });
        return handleResponse<T>(response);
    },
};
