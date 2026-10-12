import type { Profile, UpdateProfileInput, UserAvailability, UserInterest } from '@neighborhood-connect/types';

import { apiClient } from './api-client';

export async function getMyProfile(): Promise<Profile> {
  return apiClient.get<Profile>('/profile');
}

export async function updateProfile(data: UpdateProfileInput): Promise<Profile> {
  return apiClient.patch<Profile>('/profile', data);
}

export async function getProfileById(userId: string): Promise<Profile | null> {
  return apiClient.get<Profile | null>(`/profile/${userId}`);
}

export async function replaceInterests(interestIds: string[]): Promise<UserInterest[]> {
  return apiClient.put<UserInterest[]>('/profile/interests', { interestIds });
}

export async function replaceAvailability(
  availability: { availabilityId: string; dayOfWeek: string }[],
): Promise<UserAvailability[]> {
  return apiClient.put<UserAvailability[]>('/profile/availability', { availability });
}
