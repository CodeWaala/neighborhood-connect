import type { Connection, ConnectionStatus } from '@neighborhood-connect/types';

import { apiClient } from './api-client';

export type { Connection, ConnectionStatus };

/** Send a connection request. */
export async function createConnection(recipientId: string): Promise<Connection> {
  return apiClient.post<Connection>('/connections', { recipientId });
}

/** List all connections for the current user. */
export async function listConnections(): Promise<Connection[]> {
  return apiClient.get<Connection[]>('/connections');
}

/** Get a single connection by ID. */
export async function getConnection(connectionId: string): Promise<Connection> {
  return apiClient.get<Connection>(`/connections/${connectionId}`);
}

/** Accept, decline, or block a connection. */
export async function updateConnection(
  connectionId: string,
  status: ConnectionStatus,
): Promise<Connection> {
  return apiClient.patch<Connection>(`/connections/${connectionId}`, { status });
}
