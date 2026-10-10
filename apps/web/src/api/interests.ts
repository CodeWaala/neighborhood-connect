import { apiClient } from './client';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface Interest {
    id: string;
    label: string;
    category: string | null;
    isActive: boolean;
}

// ──────────────────────────────────────────────
// API Functions
// ──────────────────────────────────────────────

/** List all active interests. */
export async function listInterests(): Promise<Interest[]> {
    return apiClient.get<Interest[]>('/interests');
}
