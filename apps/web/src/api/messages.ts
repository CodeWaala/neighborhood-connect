import { apiClient } from './client';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface Message {
    id: string;
    connectionId: string;
    senderId: string;
    body: string;
    createdAt: string;
}

// ──────────────────────────────────────────────
// API Functions
// ──────────────────────────────────────────────

/** List messages for a connection. */
export async function listMessages(connectionId: string): Promise<Message[]> {
    return apiClient.get<Message[]>(`/connections/${connectionId}/messages`);
}

/** Send a message within a connection. */
export async function sendMessage(connectionId: string, body: string): Promise<Message> {
    return apiClient.post<Message>(`/connections/${connectionId}/messages`, { body });
}
