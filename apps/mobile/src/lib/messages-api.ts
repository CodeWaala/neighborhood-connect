import type { Message } from '@neighborhood-connect/types';

import { apiClient } from './api-client';

/** List messages for a connection. */
export async function listMessages(connectionId: string): Promise<Message[]> {
  return apiClient.get<Message[]>(`/connections/${connectionId}/messages`);
}

/** Send a message within a connection. */
export async function sendMessage(connectionId: string, body: string): Promise<Message> {
  return apiClient.post<Message>(`/connections/${connectionId}/messages`, { body });
}
