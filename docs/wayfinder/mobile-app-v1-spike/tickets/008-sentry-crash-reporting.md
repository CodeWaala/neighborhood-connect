---
title: Sentry crash reporting setup
label: wayfinder:task
status: closed
assignee: claude
---

## Question

Add Sentry via its Expo SDK for crash/error reporting, configured from the
start of the build per the earlier grill-with-docs decision (round 3, Q15).

## Blocked by

(none)

## Resolution

Checked current Sentry docs rather than relying on memory (their Expo setup
changes across versions). Installed `@sentry/react-native` (expo install
resolved it to 7.11.0 for SDK 57 compatibility, not latest). Swapped
`metro.config.js` to `getSentryExpoConfig` — composed with the existing
NativeWind wrapper, not a plain replacement, since that file already does
two other things (NativeWind + the ticket 002 pnpm symlink fix). Root
layout now calls `Sentry.init({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
enabled: !__DEV__ })` and exports `Sentry.wrap(RootLayout)`.

**Same pattern as ticket 007's EAS gap**: no Sentry account/project exists
yet, so there's no real DSN, org, or project slug to configure. Left the
plugin's `organization`/`project` fields unset (confirmed via the dev
server's own warning: "Environment variables will be used as a fallback
during the build") and `EXPO_PUBLIC_SENTRY_DSN` blank in `.env.example`.
`Sentry.init` with no DSN is a documented-safe no-op, so none of this
breaks anything now — it activates once a Sentry project exists and the
DSN (plus `SENTRY_AUTH_TOKEN` for source-map upload, as an EAS secret) are
set.

Verified with a full `expo start --clear` bundle (3338 modules) — the only
output was the expected missing-org/project warning, no resolution errors.
`tsc --noEmit` and `expo lint` clean.
