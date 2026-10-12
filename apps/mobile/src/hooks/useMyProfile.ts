import { getMyProfile } from '@neighborhood-connect/api-client';
import { useQuery } from '@tanstack/react-query';

import type { AvailabilitySlot, InterestRef } from '@/lib/matching';

export const MY_PROFILE_KEY = ['profile', 'me'] as const;

/** The signed-in user's profile, plus their interests and availability in matching shapes. */
export function useMyProfile() {
  return useQuery({
    queryKey: MY_PROFILE_KEY,
    queryFn: getMyProfile,
    select: (profile) => ({
      profile,
      interests: (profile.user?.interests ?? []).map((ui): InterestRef => ui.interest),
      slots: (profile.user?.availability ?? []).map(
        (ua): AvailabilitySlot => ({ dayOfWeek: ua.dayOfWeek, window: ua.availabilityWindow }),
      ),
    }),
  });
}
