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

Sign in with the dev login (development builds, and the `preview` / `beta` test builds): any email signs in or creates that
user; a blank email creates a new test user.

## Scripts

| Script | What it does |
|---|---|
| `dev` / `start` | Start the dev server for **Expo Go** |
| `dev:client` | Start the dev server for a **development build** (needed for push notifications) |
| `test` | Jest (`jest-expo` + React Native Testing Library); tests live in `__tests__/` next to the code |
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

## Push notifications (development build)

Push doesn't work in Expo Go, simulators or the web preview; the app skips it there. To test it on a phone:

1. **Expo project:** `npm i -g eas-cli`, `eas login`, then in `apps/mobile` run `eas init`. This adds
   `extra.eas.projectId` to `app.json`; commit that change.
2. **iOS** (paid Apple Developer account): `eas device:create` to register your iPhone, then
   `eas build --profile development --platform ios`. Let EAS create the push key when it asks.
3. **Android** (Firebase project): add an Android app with package `com.codewaala.nearbypals`,
   download `google-services.json` into `apps/mobile/`, add `"googleServicesFile": "./google-services.json"`
   under `android` in `app.json`, and upload an FCM V1 service-account key with `eas credentials`.
   Then `eas build --profile development --platform android`.
4. Install the build from the link EAS gives you, run `pnpm dev:client`, open the app and sign in.
   The permission prompt appears when you first reach the tabs (after onboarding).
5. Send a request or message from another account, or use https://expo.dev/notifications with the
   token the app registered (`DeviceToken` table).

Taps open Connections (new request) or the chat (accepted request, new message). While the app is
open, pushes refresh the data; a message for the chat you're in doesn't show a banner.

## Test builds & distribution (EAS)

Profiles in `eas.json`:

| Profile | Use | Dev login |
|---|---|---|
| `development` | Your own debugging and push testing; pairs with `pnpm dev:client` | yes |
| `preview` | Quick installs from a link: Android APK, iPhones registered with `eas device:create` | yes |
| `beta` | TestFlight and the Google Play internal testing track | yes |
| `production` | Public release, after Cognito sign-in replaces the dev login | no |

Before the first `preview` or `beta` build:

1. Do steps 1–3 of the push setup above (`eas init`, Apple key, Firebase).
2. Host the API somewhere the testers' phones can reach, then point the builds at it:
   `eas env:create --environment preview --name EXPO_PUBLIC_API_URL --value https://YOUR-API/v1 --visibility plaintext`
   (`preview` and `beta` both read the `preview` environment.) Without it the app tries `localhost`
   and shows "Can't reach NearbyPals".
3. Replace the placeholder app icon and splash in `assets/images/` (still Expo's defaults), and confirm
   the bundle ID `com.codewaala.nearbypals` — it can't change after the first store upload.

**Quick install link (`preview`):** `eas build --profile preview --platform all`, then share the
install page link. iPhones must be registered first (`eas device:create`).

**TestFlight (`beta`, iOS):** `eas build --profile beta --platform ios`, then
`eas submit --profile beta --platform ios`. EAS creates the App Store Connect app if needed. Add testers
in App Store Connect → TestFlight (internal testers can install right away; external testers need a
short Beta App Review).

**Play internal testing (`beta`, Android):** create the app in the Play Console, then
`eas build --profile beta --platform android`. Google requires the **first** upload to be done by hand
(download the `.aab` from EAS and upload it to Internal testing). After that,
`eas submit --profile beta --platform android` uploads to the internal track (needs a Google service
account key, which `eas submit` walks you through). Add testers by email list in the Play Console.

The QA checklist for device testing is in [`docs/mobile_qa_checklist.md`](../../docs/mobile_qa_checklist.md).

## Notes

- New screens that need sign-in must be declared inside the `Stack.Protected` guard in
  `src/app/_layout.tsx`; Expo Router adds undeclared routes outside it.
- Run the dev server without `CI=1` while editing: in CI mode Metro doesn't watch files.
- After changing an `EXPO_PUBLIC_*` value, restart with `--clear`: Metro caches the inlined values.

- pnpm workspace packages resolve in Metro without `node-linker=hoisted` (checked with `expo export` for iOS and Android).
- Bundle ID / package: `com.codewaala.nearbypals` (placeholder — confirm before the first EAS build).
- Add native packages with `npx expo install <pkg>` so versions match the SDK.
