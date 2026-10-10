import type { Neighborhood } from './neighborhood';

export type ProfileRole = 'parent' | 'pet' | 'both';

export interface Interest {
    id: string;
    label: string;
    category: string | null;
    isActive: boolean;
}

export interface AvailabilityWindow {
    id: string;
    label: string;
    timeRange: string;
}

export interface UserInterest {
    userId: string;
    interestId: string;
    interest: Interest;
}

export interface UserAvailability {
    userId: string;
    availabilityId: string;
    dayOfWeek: string;
    availabilityWindow: AvailabilityWindow;
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

export interface ProfileSummary {
    displayName: string;
    bio: string | null;
    role: ProfileRole;
    avatarUrl: string | null;
}

export interface UpdateProfileInput {
    displayName?: string;
    bio?: string;
    role?: ProfileRole;
    neighborhoodId?: string;
    avatarUrl?: string;
    isProfilePublic?: boolean;
}

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
