import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getMyProfile } from '@/lib/profile-api';

export const MY_PROFILE_KEY = ['myProfile'];

export function useMyProfile() {
  return useQuery({ queryKey: MY_PROFILE_KEY, queryFn: getMyProfile });
}

export function useInvalidateMyProfile() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: MY_PROFILE_KEY });
    void queryClient.invalidateQueries({ queryKey: ['discovery'] });
  };
}
