/**
 * API Client — typed HTTP wrapper for the NestJS backend.
 *
 * Uses the `x-user-id` header for dev authentication.
 * Will switch to `Authorization: Bearer <jwt>` when Cognito is wired (Phase 7).
 */

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/v1';

/** Stored getter — set by AuthProvider so the client can attach the user ID header. */
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

        // 401 → redirect to login
        if (response.status === 401) {
            localStorage.removeItem('nc_user_id');
            localStorage.removeItem('nc_email');
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/dev-login')) {
                window.location.assign('/dev-login');
            }
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
async function safeFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    try {
        return await fetch(input, init);
    } catch (err) {
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

    async delete<T>(path: string): Promise<T> {
        const response = await safeFetch(`${API_BASE_URL}${path}`, {
            method: 'DELETE',
            headers: buildHeaders(),
        });
        return handleResponse<T>(response);
    },
};
