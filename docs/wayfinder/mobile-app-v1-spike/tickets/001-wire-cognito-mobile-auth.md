---
title: Wire Cognito mobile auth
label: wayfinder:task
status: closed
assignee: claude
---

## Question

Implement authentication for the Mobile App: a sign-in screen, session
storage, and an `AuthContext`/hook exposing signed-in state to the rest of
the app — authenticating against the Mobile Auth Client
([ADR 0002](/docs/adr/0002-separate-cognito-app-client-for-mobile.md)) on the
same Cognito User Pool the Web App uses. Decide the native auth approach
(AWS Amplify's Auth module vs a lighter `expo-auth-session` wrapper against
the Hosted UI) by checking the API's actual Cognito configuration first —
see "Not yet specified" on the map. Gate the `(tabs)` navigator behind
signed-in state so an unauthenticated user lands on sign-in, not the tabs.

## Blocked by

(none)

## Resolution

Checked the API's actual auth state first (`apps/api/.env`, `auth.guard.ts`,
`apps/web/src/api/client.ts`): a real Cognito User Pool exists
(`us-east-1_EYGcuogCq`), but the **whole project — including the Web
App — still authenticates via dev-login** (`x-user-id` header). Real
Cognito JWT wiring is explicitly deferred project-wide to a later
"production hardening" phase; the Web App's own client comment says as
much ("Will switch to `Authorization: Bearer <jwt>` when Cognito is wired
(Phase 7)").

Given that, implementing the real native Cognito flow for the Mobile App
now would leapfrog ahead of where the rest of the project actually is.
Built **dev-login auth instead**, at parity with the Web App, so the
Mobile App is on the same footing as the rest of the codebase:

- `src/lib/api-client.ts`, `src/lib/auth-api.ts`, `src/lib/profile-api.ts` — ported from `apps/web/src/api/client.ts` / `api/auth.ts`, swapping `window.location` redirect-on-401 for a registered `onUnauthorized` callback (web-only API not available in RN).
- `src/auth/session-storage.ts` — session persisted via `expo-secure-store` (RN equivalent of the Web App's `localStorage`).
- `src/auth/AuthContext.tsx` — same state shape as `apps/web/src/contexts/AuthContext.tsx` (`userId`, `email`, `isLoading`, `isAuthenticated`, `hasProfile`, `login`, `logout`, `markProfileComplete`).
- `src/app/sign-in.tsx` — dev sign-in screen (NativeWind-styled, ported tokens), mirroring `apps/web/src/pages/DevLogin.tsx`.
- `src/app/_layout.tsx` — `AuthProvider` + a routing guard that redirects signed-out users to `/sign-in` and signed-in users away from it. The `hasProfile` → onboarding redirect is left for ticket 002, since `/onboarding` doesn't exist yet.

Verified end-to-end against the real local API (not just typechecked):
`POST /v1/auth/dev-login` → `GET /v1/auth/me` → `GET /v1/profile` (404, no
profile yet) all behaved exactly as the client code expects. `tsc --noEmit`,
`expo lint`, and `expo-doctor` (18/18) all clean.

**ADR 0002 (separate Cognito App Client) is not invalidated** — it's still
the right target once Cognito gets wired for real. That's still open; see
the map's "Not yet specified."
