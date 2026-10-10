import type { ProfileRole, ProfileSummary } from './profile';

export type ConnectionStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

export interface Connection {
    id: string;
    requesterId: string;
    recipientId: string;
    status: ConnectionStatus;
    requestedAt: string;
    respondedAt: string | null;
    requester?: { id: string; profile: ProfileSummary | null };
    recipient?: { id: string; profile: ProfileSummary | null };
}

export type { ProfileRole, ProfileSummary };
