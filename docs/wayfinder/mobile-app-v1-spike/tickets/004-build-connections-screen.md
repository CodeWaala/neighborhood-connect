---
title: Build Connections screen
label: wayfinder:task
status: closed
assignee: claude
---

## Question

Replace the Connections tab's placeholder: list pending (incoming and
outgoing) and accepted connections from the API, with accept/decline
actions on incoming requests.

## Blocked by

- [Build Discovery screen](./003-build-discovery-screen.md)

## Resolution

Built the three sections (received/sent/accepted), accept/decline mutation,
and empty state, reusing `Avatar`/`Button` from the shared kit rather than
re-styling. `tsc --noEmit` and `expo lint` clean.
