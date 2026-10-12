---
title: Push notification registration
label: wayfinder:task
status: closed
assignee: claude
---

## Question

Register the device for push via Expo's Push Notification service
([ADR 0003](/docs/adr/0003-expo-push-service-over-aws-sns.md)): request
permission at an appropriate point after sign-in, obtain the Expo push
token, and send it to a new backend endpoint/table (Device Token) so the
API can later notify on new connection requests and messages.

## Blocked by

- [Wire Cognito mobile auth](./001-wire-cognito-mobile-auth.md)

## Resolution

**Backend**: added a `DeviceToken` Prisma model + migration (`userId`,
`token` unique, `platform` enum), and a `devices` NestJS module (`POST
/v1/devices`, upserting **by token** rather than by user — the same
physical device can get re-registered to a different user after a
sign-out/sign-in). Verified against the real local API: registered a
token, then re-registered the same token under a different user and
confirmed the row's `userId` reassigned in place (same `id`, bumped
`updatedAt`).

**Mobile**: `src/lib/push.ts` requests permission (+ Android notification
channel, required since Android 13 per current docs — checked, didn't
trust memory per `AGENTS.md`), gets the Expo push token, and calls the new
endpoint. Wired to fire once from `(tabs)/_layout.tsx`, i.e. once the user
is actually inside the authenticated app.

**Real sequencing gap found, not routed around**: `getExpoPushTokenAsync`
requires an EAS `projectId`, which doesn't exist until ticket 009 creates
the EAS project. Rather than block on that, `registerForPushNotifications`
checks for the projectId and no-ops with a dev-only warning if it's
missing. The mechanism is fully wired now; it starts actually producing
tokens the moment 009 runs, with no further code changes.

**Also checked and worth flagging for when Android ships**: current Expo
docs say remote push notifications are unavailable in Expo Go on Android
since SDK 53 — a development build is required there. Doesn't affect
iOS-first testing now; will matter once the committed Android follow-on
happens.

`tsc --noEmit`, `expo lint`, and a full `expo start --clear` bundle (2951
modules) all clean.
