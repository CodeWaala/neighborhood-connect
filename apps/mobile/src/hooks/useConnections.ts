import { listConnections, updateConnection, type Connection, type ConnectionStatus } from '@neighborhood-connect/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/auth/AuthContext';

export function useConnections() {
  const { status } = useAuth();
  return useQuery({ queryKey: ['connections'], queryFn: listConnections, enabled: status === 'signedIn' });
}

/** The other person in a connection, from the current user's side. */
export function otherParty(connection: Connection, myUserId: string | null) {
  const iAmRequester = connection.requesterId === myUserId;
  const other = iAmRequester ? connection.recipient : connection.requester;
  return {
    userId: iAmRequester ? connection.recipientId : connection.requesterId,
    profile: other?.profile ?? null,
    iAmRequester,
  };
}

/** Accept or decline a request; refreshes connections and matches. */
export function useRespondToRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ connectionId, status }: { connectionId: string; status: Extract<ConnectionStatus, 'accepted' | 'declined'> }) =>
      updateConnection(connectionId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['connections'] });
      void queryClient.invalidateQueries({ queryKey: ['discovery'] });
    },
  });
}
