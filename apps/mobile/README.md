# NearbyPals mobile (`@neighborhood-connect/mobile`)

iOS + Android client for the `/v1` API, built with Expo (SDK 57, Expo Router).
Plan: [`docs/plans/mobile-app-v1.md`](../../docs/plans/mobile-app-v1.md).

## Run

```bash
pnpm install                                   # from the repo root
cp apps/mobile/env.example apps/mobile/.env.local   # then set EXPO_PUBLIC_API_URL
pnpm --filter @neighborhood-connect/mobile dev
```

Scan the QR code with Expo Go, or press `i` / `a` for a simulator (`w` opens a web preview).

`EXPO_PUBLIC_API_URL` must include `/v1`. On a real phone use your computer's LAN IP
(e.g. `http://192.168.1.20:3000/v1`), not `localhost`; the Android emulator uses `10.0.2.2`.
For the web preview, add `http://localhost:8081` to the API's `CORS_ORIGINS`.

Sign in with the dev login (development builds only): any email signs in or creates that
user; a blank email creates a new test user.

## Scripts

| Script | What it does |
|---|---|
| `dev` / `start` | Start the Metro dev server |
| `lint` | `expo lint` (ESLint, `eslint-config-expo`) |
| `typecheck` | `tsc --noEmit` |

## Layout

- `src/app/` — routes (Expo Router); every file is a screen, `_layout.tsx` files are navigators
  - `_layout.tsx` — fonts, TanStack Query, auth, and the routing guard (`Stack.Protected`):
    no user → `welcome` / `sign-in`; user without a profile → `onboarding/`; otherwise `(tabs)/`
  - `onboarding/` — name & neighborhood → role → interests → availability
  - `(tabs)/` — Discover (`index`), Connections (pending-request badge), Profile
  - `neighbor/[id]`, `request-sent`, `chat/[id]`, `edit/*` (profile editors, shown as modals)
- `src/auth/` — `AuthContext` (session restore, dev sign-in, sign-out on 401) and session storage
  (`expo-secure-store` on phones; `localStorage` in the web preview)
- `src/components/` — `Button`, `TextField`, `Screen`/`ScreenTitle`, `Avatar`, `Chip`, `Skeleton`,
  `EditScaffold`; `pickers/` (role, interests, availability) are shared by onboarding and the editors
- `src/lib/matching.ts` — shared interests and overlapping availability ("You’re both free Tue & Thu mornings")
- `src/hooks/` — data hooks (`useMyProfile`, `useConnections`, `useSendRequest`, …)
- `src/theme.ts` — colors (light + dark), Nunito font, type scale, radii; `useTheme()` follows the phone's appearance
- Icons: `lucide-react-native`
- API calls: `@neighborhood-connect/api-client` (shared with web); types: `@neighborhood-connect/types`

## Notes

- New screens that need sign-in must be declared inside the `Stack.Protected` guard in
  `src/app/_layout.tsx`; Expo Router adds undeclared routes outside it.
- Run the dev server without `CI=1` while editing: in CI mode Metro doesn't watch files.

- pnpm workspace packages resolve in Metro without `node-linker=hoisted` (checked with `expo export` for iOS and Android).
- Bundle ID / package: `com.codewaala.nearbypals` (placeholder — confirm before the first EAS build).
- Add native packages with `npx expo install <pkg>` so versions match the SDK.
