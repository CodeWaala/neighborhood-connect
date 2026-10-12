---
title: Mobile App v1 (spike) — Build Map
labels: [wayfinder:map]
---

## Destination

A feature-complete iOS Mobile App (React Native + Expo, `apps/mobile`) at MVP
parity with the Web App — onboarding, discovery, connections, messaging,
profile management — running live via Expo Go and ready for a TestFlight
beta.

## Notes

- **Execution override**: this effort carries execution into the map. Nearly
  all architecture/design decisions were already settled in a prior
  grill-with-docs session (2026-10-10/12), recorded in `GLOSSARY.md`,
  `docs/adr/0001`–`0003`, and `PROJECT.md` §12. The remaining frontier is
  build work, so tickets here are `wayfinder:task` build steps, not decision
  tickets — resolving a ticket means shipping the code, not just deciding
  something.
- Domain language: see `GLOSSARY.md` (Web App, Mobile App, Mobile Auth
  Client, Device Token).
- If a genuinely new design question surfaces mid-build (not just "how do I
  implement this"), stop and ticket it properly as `wayfinder:grilling`
  instead of deciding it inline.
- Stack: React Native + Expo Router + NativeWind, already scaffolded with
  ported design tokens and a tab shell (Discovery/Connections/
  Messages/Profile placeholders).
- **Tracker**: local-markdown (no GitHub Issues configured on this repo).
  Tickets live under `docs/wayfinder/mobile-app-v1-spike/tickets/`. No native
  blocking here, so each ticket's body carries a `Blocked by` list as the
  fallback convention. "Claiming" a ticket = setting its `assignee`
  frontmatter field.

## Decisions so far

- [React Native (Expo) for the Mobile App, not native Swift](/docs/adr/0001-react-native-expo-for-mobile-app.md): RN+Expo, in-monorepo `apps/mobile`, driven by solo dev + Android as a near-term follow-on.
- [Separate Cognito App Client for the Mobile App](/docs/adr/0002-separate-cognito-app-client-for-mobile.md): own redirect scheme/session lifetime, same User Pool as the Web App.
- [Expo Push Notification Service over AWS SNS](/docs/adr/0003-expo-push-service-over-aws-sns.md): Expo Push, not raw APNs/SNS credentials.
- **Scope & UX** (grill-with-docs, 2026-10-10/12): full MVP feature parity for v1 (no slicing); code-first screen design (no separate mockup stage); Expo Router navigation; NativeWind-ported design tokens; online-required for v1 (no offline caching); Sentry crash reporting from day one; TestFlight beta before App Store. Full summary in `PROJECT.md` §12.
- **Navigation shell + design tokens**: built — Expo Router `(tabs)` group (Discovery/Connections/Messages/Profile placeholders), NativeWind with the Web App's HSL tokens ported 1:1, `tsc --noEmit` / `expo lint` / `expo-doctor` all clean.
- [Wire Cognito mobile auth](./tickets/001-wire-cognito-mobile-auth.md): the whole project (Web App included) still runs on dev-login, not real Cognito — so the Mobile App got dev-login auth (`AuthContext`, sign-in screen, routing guard) at parity with the Web App instead of jumping ahead. Verified end-to-end against the real local API.
- [Build Onboarding flow](./tickets/002-build-onboarding-flow.md): all four screens built, root layout gates `(tabs)` behind `hasProfile`. Also fixed a real Metro + pnpm symlink resolution bug (`react-native-css-interop/jsx-runtime`) that would have blocked every NativeWind screen going forward.
- [Build Discovery screen](./tickets/003-build-discovery-screen.md): real Discovery screen, plus `/neighbor/[id]` (full profile + connect/accept) and `/request-sent` (confirmation), which weren't separately ticketed but are the same flow.
- [Build Connections screen](./tickets/004-build-connections-screen.md): received/sent/accepted sections with accept/decline.
- [Build Messages screen](./tickets/005-build-messages-screen.md): added a thread-list Messages tab (the web app has no equivalent — it links straight from Connections) plus `/chat/[id]` with 5s polling.
- [Build Profile management screen](./tickets/006-build-profile-screen.md): hub + 4 focused editors instead of one long form; dropped child/pet-info fields since they're non-functional on the web too.
- [Push notification registration](./tickets/007-push-notification-registration.md): new `DeviceToken` model + `POST /v1/devices` (upserts by token, verified against the real API), mobile side requests permission and registers — but can't produce real tokens until ticket 009 creates the EAS project (`getExpoPushTokenAsync` needs a `projectId`). No-ops gracefully until then.
- [Sentry crash reporting setup](./tickets/008-sentry-crash-reporting.md): `Sentry.init`/`Sentry.wrap` wired, `metro.config.js` composed with `getSentryExpoConfig`. Same no-Sentry-account-yet gap as 007 — no-ops safely without a DSN until one exists.

## Frontier

- [EAS build & TestFlight setup](./tickets/009-eas-build-testflight.md) —
  everything AFK-possible is done (`eas.json`, bundle identifier, app
  identity). What's left is genuinely HITL: `eas login`, `eas init` (which
  also unblocks real push tokens — see ticket 007), Apple Developer
  enrollment, `eas build`, `eas submit`. See the ticket's "Progress"
  section for the exact ordered checklist.

## Not yet specified

- Whether the Mobile Auth Client's native flow uses AWS Amplify's Auth module
  vs a lighter `expo-auth-session` wrapper directly against Cognito's Hosted
  UI — still open. Ticket 001 found that the whole project defers real
  Cognito wiring to a later phase, so this sharpens once that phase is
  actually reached (project-wide, not mobile-specific).

## Out of scope

(none yet — nothing has been ruled beyond the destination)
