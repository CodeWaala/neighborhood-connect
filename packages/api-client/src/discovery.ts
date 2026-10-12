import { apiClient } from './client';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface DiscoveryMatch {
    id: string;
    profile: {
        displayName: string;
        bio: string | null;
        role: 'parent' | 'pet' | 'both';
        avatarUrl: string | null;
        neighborhoodId: string;
    } | null;
    interests: Array<{
        interest: {
            id: string;
            label: string;
        };
    }>;
    availability: Array<{
        dayOfWeek: string;
        availabilityWindow: {
            id: string;
            label: string;
            timeRange: string;
        };
    }>;
}

export interface DiscoveryOptions {
    limit?: number;
    role?: string;
    includeConnected?: boolean;
}

// ──────────────────────────────────────────────
// API Functions
// ──────────────────────────────────────────────

/** Get curated discovery matches. */
export async function listMatches(options?: DiscoveryOptions): Promise<DiscoveryMatch[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.role) params.set('role', options.role);
    if (options?.includeConnected) params.set('includeConnected', 'true');

    const query = params.toString();
    return apiClient.get<DiscoveryMatch[]>(`/discovery${query ? `?${query}` : ''}`);
}
