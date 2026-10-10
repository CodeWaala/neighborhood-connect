// Barrel export — re-export all API modules
export { apiClient, ApiError, setGetUserId } from './client';
export * as authApi from './auth';
export * as profileApi from './profile';
export * as neighborhoodsApi from './neighborhoods';
export * as interestsApi from './interests';
export * as availabilityApi from './availability';
export * as discoveryApi from './discovery';
export * as connectionsApi from './connections';
export * as messagesApi from './messages';
