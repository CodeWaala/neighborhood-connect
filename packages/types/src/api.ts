export interface ApiError {
    error: {
        code: string;
        message: string;
    };
}

export interface PaginatedResponse<T> {
    data: T[];
    cursor: string | null;
    hasMore: boolean;
}

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
