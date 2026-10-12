import type { Neighborhood } from '@neighborhood-connect/types';

import { apiClient } from './api-client';

/** Search neighborhoods by name, city, or postal code. */
export async function searchNeighborhoods(query: string): Promise<Neighborhood[]> {
  return apiClient.get<Neighborhood[]>(`/neighborhoods/search?q=${encodeURIComponent(query)}`);
}

/** Get a single neighborhood by ID. */
export async function getNeighborhood(id: string): Promise<Neighborhood | null> {
  return apiClient.get<Neighborhood | null>(`/neighborhoods/${id}`);
}
