import type { AvailabilityWindow } from '@neighborhood-connect/types';

import { apiClient } from './api-client';

/** List all availability time windows. */
export async function listAvailabilityWindows(): Promise<AvailabilityWindow[]> {
  return apiClient.get<AvailabilityWindow[]>('/availability/windows');
}
