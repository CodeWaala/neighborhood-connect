import { listConnections } from '@neighborhood-connect/api-client';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/auth/AuthContext';

/** Connection requests waiting on the current user (drives the Connections tab badge). */
export function usePendingRequestCount(): number {
  const { status, userId } = useAuth();
  const { data } = useQuery({
    queryKey: ['connections'],
    queryFn: listConnections,
    enabled: status === 'signedIn',
  });

  return data?.filter((c) => c.status === 'pending' && c.recipientId === userId).length ?? 0;
}
