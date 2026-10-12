---
title: EAS build & TestFlight setup
label: wayfinder:task
status: open
assignee: claude
---

## Question

Configure EAS (`eas.json` build profiles, `app.json`/Expo config such as the
bundle identifier), build an iOS binary, and submit it to TestFlight for the
first beta.

## Blocked by

- [Build Discovery screen](./003-build-discovery-screen.md)
- [Build Connections screen](./004-build-connections-screen.md)
- [Build Messages screen](./005-build-messages-screen.md)
- [Build Profile management screen](./006-build-profile-screen.md)
- [Push notification registration](./007-push-notification-registration.md)

## Progress (left open — genuinely HITL from here)

Did everything that doesn't require an authenticated account
(`npx eas-cli whoami` confirmed: not logged in, and I'm not going to attempt
logging into your Expo/Apple accounts):

- `app.json`: real app identity — `name: "Neighborhood Connect"`,
  `slug: "neighborhood-connect"`, `ios.bundleIdentifier` /
  `android.package` both `com.neighborhoodconnect.mobile` (matches the
  `neighborhoodconnect.com` domains in `docs/development-plan.md`).
- `eas.json`: `development` (dev client, internal), `preview` (internal,
  auto-incrementing iOS build number), `production` (store distribution,
  auto-incrementing build number) profiles. Checked current EAS Build docs
  for this rather than assuming the shape is stable. Left `submit.production`
  empty rather than guessing at real `appleId`/`ascAppId`/`appleTeamId`
  values — `eas submit` prompts interactively for these on first use if
  they're not in `eas.json`.
- Verified none of this broke anything: full `expo start --clear` bundle
  (3385 modules), `tsc --noEmit`, `expo lint`, `expo-doctor` (same one
  known/accepted deviation as before) all clean.

**What's left — needs you, in order:**

1. `npx eas-cli login` (or create an Expo account at expo.dev first).
2. From `apps/mobile`: `npx eas-cli init` — links the project and writes a
   real `extra.eas.projectId` into `app.json`. This alone activates ticket
   007's push registration (it currently no-ops for exactly this reason).
3. Apple Developer Program enrollment if you don't already have one
   ($99/year) — required for TestFlight/App Store.
4. `npx eas-cli build --platform ios --profile preview` — first real iOS
   build. EAS will offer to manage signing credentials for you
   (recommended unless you already have certificates).
5. `npx eas-cli submit --platform ios --profile production` (or let the
   build prompt you to submit right after it finishes) — uploads to App
   Store Connect. First run asks for your Apple ID and team; add them to
   `eas.json`'s `submit.production.ios` afterward if you want it
   non-interactive next time.
6. In App Store Connect → TestFlight, add internal testers (yourself, at
   minimum) to the build.
7. Separately, whenever you set up the Sentry account for ticket 008: fill
   in that plugin's `organization`/`project` in `app.json`, set
   `EXPO_PUBLIC_SENTRY_DSN`, and add `SENTRY_AUTH_TOKEN` as an EAS secret
   (`eas secret:create`) so source maps upload during the build.
