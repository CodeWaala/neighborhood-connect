import { apiClient } from './client';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type ConnectionStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

export interface Connection {
    id: string;
    requesterId: string;
    recipientId: string;
    status: ConnectionStatus;
    requestedAt: string;
    respondedAt: string | null;
    requester?: {
        id: string;
        profile: {
            displayName: string;
            bio: string | null;
            role: string;
            avatarUrl: string | null;
        } | null;
    };
    recipient?: {
        id: string;
        profile: {
            displayName: string;
            bio: string | null;
            role: string;
            avatarUrl: string | null;
        } | null;
    };
}

// ──────────────────────────────────────────────
// API Functions
// ──────────────────────────────────────────────

/** Send a connection request. */
export async function createConnection(recipientId: string): Promise<Connection> {
    return apiClient.post<Connection>('/connections', { recipientId });
}

/** List all connections for the current user. */
export async function listConnections(): Promise<Connection[]> {
    return apiClient.get<Connection[]>('/connections');
}

/** Get a single connection by ID. */
export async function getConnection(connectionId: string): Promise<Connection> {
    return apiClient.get<Connection>(`/connections/${connectionId}`);
}

/** Accept, decline, or block a connection. */
export async function updateConnection(
    connectionId: string,
    status: ConnectionStatus,
): Promise<Connection> {
    return apiClient.patch<Connection>(`/connections/${connectionId}`, { status });
}
