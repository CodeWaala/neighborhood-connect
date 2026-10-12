/**
 * Runtime config, read from `EXPO_PUBLIC_*` env vars (inlined by Metro at build time).
 * See `env.example`.
 */

/** API base URL including `/v1`. On a real phone this must be your computer's LAN IP. */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';

/** Dev login is only offered in development builds; Cognito sign-in replaces it later. */
export const DEV_LOGIN_ENABLED = __DEV__;
