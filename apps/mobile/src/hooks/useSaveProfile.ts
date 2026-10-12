import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { MY_PROFILE_KEY } from './useMyProfile';

/** Run a profile save, refresh everything that depends on the profile, then close the editor. */
export function useSaveProfile<T>(save: (input: T) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: save,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MY_PROFILE_KEY });
      void queryClient.invalidateQueries({ queryKey: ['discovery'] });
      router.back();
    },
  });
}

export function saveErrorMessage(error: unknown): string | null {
  if (!error) return null;
  return error instanceof Error ? `Couldn’t save: ${error.message}` : 'Couldn’t save. Please try again.';
}
