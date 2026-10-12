import { apiClient } from './client';
import type { Neighborhood } from './neighborhoods';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type ProfileRole = 'parent' | 'pet' | 'both';

export interface Child {
    id: string;
    profileId: string;
    ageRange: string;
}

export interface Pet {
    id: string;
    profileId: string;
    petType: string;
    petName: string | null;
}

export interface UserInterest {
    userId: string;
    interestId: string;
    interest: {
        id: string;
        label: string;
        category: string | null;
    };
}

export interface UserAvailability {
    userId: string;
    availabilityId: string;
    dayOfWeek: string;
    availabilityWindow: {
        id: string;
        label: string;
        timeRange: string;
    };
}

export interface Profile {
    userId: string;
    displayName: string;
    bio: string | null;
    role: ProfileRole;
    neighborhoodId: string;
    avatarUrl: string | null;
    isProfilePublic: boolean;
    updatedAt: string;
    neighborhood?: Neighborhood;
    children?: Child[];
    pets?: Pet[];
    user?: {
        interests: UserInterest[];
        availability: UserAvailability[];
    };
}

export interface UpdateProfileInput {
    displayName?: string;
    bio?: string;
    role?: ProfileRole;
    neighborhoodId?: string;
    avatarUrl?: string;
    isProfilePublic?: boolean;
}

// ──────────────────────────────────────────────
// API Functions
// ──────────────────────────────────────────────

/** Get the current user's profile. */
export async function getMyProfile(): Promise<Profile> {
    return apiClient.get<Profile>('/profile');
}

/** Create or update the current user's profile. */
export async function updateProfile(data: UpdateProfileInput): Promise<Profile> {
    return apiClient.patch<Profile>('/profile', data);
}

/** Get a profile by user ID. */
export async function getProfileById(userId: string): Promise<Profile | null> {
    return apiClient.get<Profile | null>(`/profile/${userId}`);
}

/** Replace the current user's interests. */
export async function replaceInterests(interestIds: string[]): Promise<UserInterest[]> {
    return apiClient.put<UserInterest[]>('/profile/interests', { interestIds });
}

/** Replace the current user's availability. */
export async function replaceAvailability(
    availability: { availabilityId: string; dayOfWeek: string }[],
): Promise<UserAvailability[]> {
    return apiClient.put<UserAvailability[]>('/profile/availability', { availability });
}
