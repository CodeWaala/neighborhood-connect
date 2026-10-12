# Mobile App v1: React Native + Expo

## Goal

Ship an iOS + Android app for NearbyPals that covers the full MVP loop (onboard → discover → connect → message) with push alerts for new requests and messages. The web app and API stay as they are; the mobile app is a new client of the same `/v1` API.

**Branch:** `Mobile-app-v1`
**Designs:** NearbyPals Mobile canvas (Claude Design artifact) — Option A Discover, light + dark.

## Decisions Locked

| Decision | Choice |
|---|---|
| Framework | React Native with Expo (managed workflow, Expo Router) |
| Auth for v1 | Existing dev login (`POST /v1/auth/dev-login` + `x-user-id` header). Cognito comes later, as its own phase. |
| Notifications | Included in v1: new connection request, request accepted, new message |
| Location in repo | `apps/mobile` inside the existing pnpm + Turborepo monorepo |

## Out of Scope for v1

- Cognito / real sign-in (the Sign in screens are designed and wait for the auth phase)
- Avatars / photo upload
- App Store / Play Store public release (v1 targets internal testing: TestFlight + Play internal track)
- Option B Discover ("one at a time")

## Progress

| Phase | Status | Notes |
|---|---|---|
| M1 | Done | Expo SDK 57; Metro resolves pnpm workspace packages without `node-linker=hoisted`. Bundle ID placeholder `com.codewaala.nearbypals`. |
| M2 | Done | If the API can't be reached at launch, the session is kept and a retry screen is shown (web signs out instead). |
| M3 | Done | |
| M4 | Done | No API change needed: `GET /discovery` already returns each match's full interests and availability, so overlap is computed in the app. |
| M5 | Done | Connected rows fetch each chat's messages for the last-message preview (no API change). |
| M6 | Done | API: `PATCH /profile` gains `childAgeRange`; discovery now hides profiles with `isProfilePublic=false`. |
| M7 | Done (code) | API sends pushes (expo-server-sdk v5, the newest CommonJS release that supports Node 20). Needs `eas init`, Apple + Firebase credentials and a development build to test on a phone; see `apps/mobile/README.md`. Message pushes include the first 80 characters (open question 3). |
| M8 | Not started | |

---

## Phase M1: Project Setup

### M1.1 Create the Expo app

**Folder:** `apps/mobile` (new)

- Scaffold with `create-expo-app` (TypeScript, Expo Router), latest stable SDK at setup time
- Package name `@neighborhood-connect/mobile`; add `dev`, `lint`, `typecheck` scripts so `turbo` picks it up
- pnpm + Metro: add `node-linker=hoisted` to `.npmrc` **only if** Metro fails to resolve workspace packages (verify first; it affects the whole repo)
- App identifiers: `com.[yourorg].nearbypals` (iOS bundle ID + Android package) — **[decide]**

### M1.2 Theme

**File:** `apps/mobile/src/theme.ts` (new)

Port tokens from `apps/web/src/index.css`, using the adjusted values from the designs:

| Token | Light | Dark |
|---|---|---|
| background | `#F9F8F4` | `#1F1914` |
| card | `#FDFCF9` | `#2A231D` |
| foreground | `#403326` | `#F5F4F0` |
| mutedForeground | `#756457` | `#A3998F` |
| border | `#E7E0DA` | `#403730` |
| primary (buttons) | `#40775C` (darkened from web's `#509573` for white-text contrast) | `#64B48C` |
| onPrimary | `#FFFFFF` | `#1F1914` |
| primarySoft | `#E6F0EB` | `#293D33` |
| accentSoft / onAccentSoft | `#F9EBE6` / `#8A3A1F` | `#422B24` / `#F0A68C` |

- Font: Nunito via `@expo-google-fonts/nunito`
- Follow the phone's system appearance (`useColorScheme`); no in-app toggle in v1
- Icons: `lucide-react-native` (same icon set as web)

### M1.3 Shared code

- Consume `@neighborhood-connect/types` (already exists)
- **New package** `packages/api-client`: move `apps/web/src/api/*` here, with the base URL and user-ID getter injected instead of read from `import.meta.env`. Web and mobile both import it. Web keeps working unchanged apart from imports.

---

## Phase M2: App Shell & Dev Auth

**Files:** `apps/mobile/app/_layout.tsx`, `apps/mobile/src/auth/*`

- TanStack Query provider (same defaults as web: `retry: 1`, `staleTime: 30s`)
- Auth context: store `userId` in `expo-secure-store`; restore on launch
- Dev login screen: email field → `POST /v1/auth/dev-login` (dev builds only)
- API URL from `EXPO_PUBLIC_API_URL` — on a real phone this must be your computer's LAN IP (e.g. `http://192.168.x.x:3000/v1`), not `localhost`
- Routing guard: no user → Welcome; user without profile → onboarding; else tabs
- Bottom tabs: Discover, Connections (pending-request badge), Profile

---

## Phase M3: Onboarding

Screens: Welcome, Name & neighborhood, Role, Interests, Availability (designs row 1).

- Reuse the web `OnboardingContext` logic as a mobile context
- Neighborhood search: debounced `GET /v1/neighborhoods/search`
- Interests from `GET /v1/interests`; windows from `GET /v1/availability/windows`
- Finish → create profile, interests, availability (same calls as web) → Discover

---

## Phase M4: Discover, Profile, Connect

Screens: Discover (+ loading and empty states), Neighbor profile, Request sent.

- `GET /v1/discovery` → match cards with shared interests and the "You're both free …" line
- **API change:** discovery should return the overlapping days/windows (or both availabilities) so the app doesn't compute overlap from partial data — confirm what `discovery.service.ts` returns today
- Pull-to-refresh replaces web's "Check Back Later"
- Invite a Neighbor → native share sheet
- Connect → `POST /v1/connections` → Request sent screen

---

## Phase M5: Connections & Chat

Screens: Connections (+ empty), Chat (+ empty).

- `GET /v1/connections` split into Requests / Connected / Sent
- Accept / Decline → `PATCH /v1/connections/:id`
- Chat: `GET/POST /v1/connections/:id/messages`; keyboard-aware composer; text only, no read receipts
- Refresh the open chat when a message push arrives (and poll every ~10s while open, as a fallback)

---

## Phase M6: Profile & Editors

Screens: My profile, Edit interests, Edit availability (day × time grid), Edit about me (child age + 300-char bio).

- `PATCH /v1/profile`, interests and availability endpoints (same as web ProfileEdit)
- "Show me in matches" → `isProfilePublic`
- Sign out clears secure store + unregisters the push token

---

## Phase M7: Push Notifications

### API (apps/api)

1. **Prisma:** new `DeviceToken` model — `id`, `userId`, `token` (unique), `platform`, `createdAt`, `lastSeenAt`
2. **Endpoints:** `POST /v1/devices` (register/refresh token), `DELETE /v1/devices/:token` (on sign-out)
3. **Sender:** `NotificationsService` using `expo-server-sdk` (Expo Push Service)
4. **Triggers:**
   - Connection created → notify recipient: "[Name] wants to connect"
   - Connection accepted → notify requester: "[Name] accepted — say hello"
   - Message created → notify the other person: "[Name]: [first 80 chars]"
5. Remove tokens Expo reports as `DeviceNotRegistered`
6. Send after the DB write succeeds; never fail the request if push fails

### Mobile

- `expo-notifications` + `expo-device`: ask permission after onboarding (not on first launch)
- Register the Expo push token → `POST /v1/devices`
- Tap handling: request → Connections tab; message → that chat
- Push needs a **development build** (EAS), not Expo Go, and a real device
- iOS push needs an **Apple Developer account** (paid); Android needs a **Firebase project** for FCM credentials — **[owner to set up]**

---

## Phase M8: Test & Distribute

- Unit tests for hooks/utilities (Jest + React Native Testing Library)
- Manual QA pass using `docs/qa_test_plan.md` flows, on one iPhone and one Android phone, light and dark
- EAS Build profiles: `development`, `preview` (internal), `production`
- Internal distribution: TestFlight (iOS), Play Console internal testing (Android)

---

## Later: Cognito Auth (separate phase)

Replace dev login with email one-time code (designed: Sign in → Code) via Cognito, send `Authorization: Bearer <jwt>` (the API guard already verifies JWTs), store tokens in secure store.

## Open Questions

1. App/bundle identifier and the display name on the home screen ("NearbyPals"?)
2. Who owns the Apple Developer and Google Play accounts?
3. Should a push for a new message include the message text, or just "New message from [Name]" for privacy?
