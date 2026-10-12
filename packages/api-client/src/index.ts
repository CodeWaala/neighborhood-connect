// Barrel export — re-export all API modules
export { apiClient, ApiError, configureApiClient, setGetUserId } from './client';
export type { ApiClientConfig, ApiErrorResponse } from './client';
export * as authApi from './auth';
export * as profileApi from './profile';
export * as neighborhoodsApi from './neighborhoods';
export * as interestsApi from './interests';
export * as availabilityApi from './availability';
export * as discoveryApi from './discovery';
export * as connectionsApi from './connections';
export * as messagesApi from './messages';

// Flat re-exports so callers can `import { listMatches, type DiscoveryMatch } from '@neighborhood-connect/api-client'`
export * from './auth';
export * from './profile';
export * from './neighborhoods';
export * from './interests';
export * from './availability';
export * from './discovery';
export * from './connections';
export * from './messages';
