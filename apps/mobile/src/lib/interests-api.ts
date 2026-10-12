import type { Interest } from '@neighborhood-connect/types';

import { apiClient } from './api-client';

/** List all active interests. */
export async function listInterests(): Promise<Interest[]> {
  return apiClient.get<Interest[]>('/interests');
}
