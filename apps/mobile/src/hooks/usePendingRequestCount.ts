import { useAuth } from '@/auth/AuthContext';

import { useConnections } from './useConnections';

/** Connection requests waiting on the current user (drives the Connections tab badge). */
export function usePendingRequestCount(): number {
  const { userId } = useAuth();
  const { data } = useConnections();
  return data?.filter((c) => c.status === 'pending' && c.recipientId === userId).length ?? 0;
}
