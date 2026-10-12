---
title: Build Messages screen
label: wayfinder:task
status: closed
assignee: claude
---

## Question

Replace the Messages tab's placeholder: list accepted connections with a
conversation view, 1:1 text-only send/receive wired to the API.

## Blocked by

- [Build Connections screen](./004-build-connections-screen.md)

## Resolution

The web app has no standalone "conversation list" page (Connections' cards
link straight to `/messages/:id`), but the Mobile App's tab bar needs real
content for its own Messages tab — so this added a thread list (accepted
connections) at `(tabs)/messages.tsx`, pushing to `/chat/[id]` for the
actual conversation (polling every 5s via `refetchInterval`, matching the
web app's polling interval). `tsc --noEmit` and `expo lint` clean.
