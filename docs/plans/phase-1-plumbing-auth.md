# Phase 1: Plumbing & Auth Foundation

> **Status: ✅ COMPLETE** — Implemented on 2026-04-03

## Goal

Make the API callable from the web app with an authenticated user context. This is the critical-path foundation — nothing else works until the web app can talk to the API.

## Prerequisites

- PostgreSQL running locally with `neighborhood_connect` database
- API runs on `http://localhost:3000`
- Web runs on `http://localhost:8080`

---

## Tasks

### 1.1 Enable CORS on API ✅

**File:** `apps/api/src/main.ts`

Added CORS configuration with configurable `CORS_ORIGINS` env var (comma-separated list). Defaults to `http://localhost:8080` for the Vite dev server.

```typescript
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:8080')
  .split(',')
  .map((s) => s.trim());
app.enableCors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
});
```

**Implementation notes:**
- Added `CORS_ORIGINS` to `apps/api/env.example`
- Verified CORS preflight returns correct `Access-Control-Allow-*` headers

---

### 1.2 Create API Client Module ✅

**File:** `apps/web/src/api/client.ts`

Created a typed HTTP client using native `fetch` that:
- Reads base URL from `VITE_API_URL` env var (default `http://localhost:3000/v1`)
- Automatically attaches the `x-user-id` header via a `setGetUserId()` hook wired to the AuthContext
- Provides typed `get`, `post`, `patch`, `put`, `delete` helper methods
- Returns typed `ApiError` with `status`, `code`, and `message` for all non-2xx responses
- Handles 204 No Content responses

**Implementation notes:**
- Uses a `setGetUserId` function that AuthContext calls to wire in the current userId
- No external dependencies (no axios) — pure fetch

---

### 1.3 Create API Service Functions ✅

**Files:** `apps/web/src/api/` directory (8 service files + barrel export)

| File | Functions | Types Exported |
|------|-----------|----------------|
| `auth.ts` | `devLogin(email?)`, `getMe()` | `AuthUser`, `AuthMeResponse` |
| `profile.ts` | `getMyProfile()`, `updateProfile()`, `getProfileById()`, `replaceInterests()`, `replaceAvailability()` | `Profile`, `UpdateProfileInput`, `UserInterest`, `UserAvailability`, etc. |
| `neighborhoods.ts` | `searchNeighborhoods(query)`, `getNeighborhood(id)` | `Neighborhood` |
| `interests.ts` | `listInterests()` | `Interest` |
| `availability.ts` | `listAvailabilityWindows()` | `AvailabilityWindow` |
| `discovery.ts` | `listMatches(options?)` | `DiscoveryMatch`, `DiscoveryOptions` |
| `connections.ts` | `createConnection()`, `listConnections()`, `updateConnection()` | `Connection`, `ConnectionStatus` |
| `messages.ts` | `listMessages()`, `sendMessage()` | `Message` |

Barrel export in `apps/web/src/api/index.ts` re-exports all modules as namespaced imports (e.g., `authApi`, `profileApi`, etc.).

---

### 1.4 Create Auth Context / Provider ✅

**File:** `apps/web/src/contexts/AuthContext.tsx`

Created a React context that:
- Stores `userId` and `email` in state, persisted to `localStorage` (`nc_user_id`, `nc_email` keys)
- Provides `login(email?)`, `logout()` methods
- On mount, checks `localStorage` and validates via `GET /v1/auth/me`
- Auto-detects `hasProfile` by attempting `GET /v1/profile` after login
- Exposes `isAuthenticated`, `isLoading`, `userId`, `email`, `hasProfile` to consumers
- Wires the API client's `x-user-id` header via `setGetUserId()`

**Usage:**
```typescript
const { userId, isAuthenticated, hasProfile, login, logout } = useAuth();
```

**Implementation notes:**
- Wrapped the entire app in `<AuthProvider>` in `App.tsx`
- Session validation happens once on mount, not on every render

---

### 1.5 Add Dev Login Screen ✅

**File:** `apps/web/src/pages/DevLogin.tsx`

Created a styled dev login page with:
- `DEV MODE` badge (amber pill at top)
- Email input field (optional — leave blank for auto-generated user)
- "Continue" button that calls `POST /v1/auth/dev-login`
- Automatic redirect: → `/onboarding` if no profile, → `/discovery` if profile exists
- Info card explaining this is dev-only (Cognito in production)
- Error toast if API is unreachable

**Route:** `/dev-login` added to `App.tsx`

---

### 1.6 Seed Neighborhoods ✅

**File:** `apps/api/prisma/seed.ts`

Added 8 Portland neighborhoods:
- Riverside, Oak Park, Sellwood, Pearl District, Hawthorne, Alberta Arts, Division, Mississippi
- Uses `findFirst` + `create` pattern (not `upsert` since `Neighborhood` doesn't have a unique name constraint)
- Idempotent — skips existing neighborhoods

**Verified:** `npx prisma db seed` ran successfully. `GET /v1/neighborhoods/search?query=river` returns `[{ "name": "Riverside", "city": "Portland", ... }]`.

---

### Bonus: Auth Guard Type Fix ✅

**File:** `apps/api/src/auth/auth.guard.ts`

Fixed a pre-existing TypeScript error where `payload.email` (type `unknown` from JWT) was assigned to a `string | undefined` property. Added explicit cast: `payload.email as string | undefined`.

---

## Verification Checklist

- [x] API starts without errors: `cd apps/api && pnpm start:dev`
- [x] Web compiles without errors: `npx tsc --noEmit` (zero errors)
- [x] CORS preflight from `localhost:8080` returns correct `Access-Control-Allow-Origin` header
- [x] `POST /v1/auth/dev-login` creates a user → returns `{ userId, email }`
- [x] `GET /v1/auth/me` with `x-user-id` header returns `{ ok: true, user: {...} }`
- [x] `GET /v1/neighborhoods/search?query=river` returns Riverside
- [x] `GET /v1/interests` returns 5 seeded interests
- [x] `GET /v1/availability/windows` returns 3 seeded time windows
- [x] All 8 API service files created with typed functions
- [x] AuthContext persists `userId` to localStorage and wires it to the API client
- [x] DevLogin page created at `/dev-login` route
- [x] App wrapped in `<AuthProvider>` in `App.tsx`

## Files Changed

| File | Change |
|------|--------|
| `apps/api/src/main.ts` | Added CORS configuration |
| `apps/api/src/auth/auth.guard.ts` | Fixed `payload.email` type cast |
| `apps/api/prisma/seed.ts` | Added 8 neighborhoods |
| `apps/api/env.example` | Added `CORS_ORIGINS` |
| `apps/web/src/api/client.ts` | **New** — HTTP client |
| `apps/web/src/api/auth.ts` | **New** — Auth API service |
| `apps/web/src/api/profile.ts` | **New** — Profile API service |
| `apps/web/src/api/neighborhoods.ts` | **New** — Neighborhoods API service |
| `apps/web/src/api/interests.ts` | **New** — Interests API service |
| `apps/web/src/api/availability.ts` | **New** — Availability API service |
| `apps/web/src/api/discovery.ts` | **New** — Discovery API service |
| `apps/web/src/api/connections.ts` | **New** — Connections API service |
| `apps/web/src/api/messages.ts` | **New** — Messages API service |
| `apps/web/src/api/index.ts` | **Replaced** — Barrel export for all services |
| `apps/web/src/contexts/AuthContext.tsx` | **New** — Auth context provider |
| `apps/web/src/pages/DevLogin.tsx` | **New** — Dev login page |
| `apps/web/src/App.tsx` | Added AuthProvider wrapper + `/dev-login` route |
