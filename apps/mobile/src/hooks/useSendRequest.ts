import { ApiError, createConnection } from '@neighborhood-connect/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

/** Send a connection request, refresh matches/connections, then show the Request sent screen. */
export function useSendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: string; name: string }) => createConnection(userId),
    onSuccess: (_connection, { name }) => {
      void queryClient.invalidateQueries({ queryKey: ['discovery'] });
      void queryClient.invalidateQueries({ queryKey: ['connections'] });
      router.push({ pathname: '/request-sent', params: { name } });
    },
  });
}

/** User-facing message for a failed request. */
export function sendRequestErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 409) {
    return 'You already have a request with this neighbor. Check Connections.';
  }
  return error instanceof Error ? error.message : 'Couldn’t send the request. Please try again.';
}
