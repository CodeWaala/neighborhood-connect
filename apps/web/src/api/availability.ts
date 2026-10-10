import { apiClient } from './client';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface AvailabilityWindow {
    id: string;
    label: string;
    timeRange: string;
}

// ──────────────────────────────────────────────
// API Functions
// ──────────────────────────────────────────────

/** List all availability time windows. */
export async function listAvailabilityWindows(): Promise<AvailabilityWindow[]> {
    return apiClient.get<AvailabilityWindow[]>('/availability/windows');
}
