---
title: Push notification registration
label: wayfinder:task
status: open
assignee: null
---

## Question

Register the device for push via Expo's Push Notification service
([ADR 0003](/docs/adr/0003-expo-push-service-over-aws-sns.md)): request
permission at an appropriate point after sign-in, obtain the Expo push
token, and send it to a new backend endpoint/table (Device Token) so the
API can later notify on new connection requests and messages.

## Blocked by

- [Wire Cognito mobile auth](./001-wire-cognito-mobile-auth.md)
