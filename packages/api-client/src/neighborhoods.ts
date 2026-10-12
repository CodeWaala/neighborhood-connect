import { apiClient } from './client';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface Neighborhood {
    id: string;
    name: string;
    city: string | null;
    region: string | null;
    postalCode: string | null;
}

// ──────────────────────────────────────────────
// API Functions
// ──────────────────────────────────────────────

/** Search neighborhoods by name, city, or postal code. */
export async function searchNeighborhoods(query: string): Promise<Neighborhood[]> {
    return apiClient.get<Neighborhood[]>(`/neighborhoods/search?q=${encodeURIComponent(query)}`);
}

/** Get a single neighborhood by ID. */
export async function getNeighborhood(id: string): Promise<Neighborhood | null> {
    return apiClient.get<Neighborhood | null>(`/neighborhoods/${id}`);
}
