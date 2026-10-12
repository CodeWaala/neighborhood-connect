---
title: Build Discovery screen
label: wayfinder:task
status: closed
assignee: claude
---

## Question

Replace the Discovery tab's placeholder with the real screen: fetch curated
nearby matches from the API (same neighborhood + at least one shared
interest + overlapping availability), render match cards, and wire the
"send connection request" action.

## Blocked by

- [Build Onboarding flow](./002-build-onboarding-flow.md)

## Resolution

Built the real Discovery screen (`FlatList` of `MatchCard`s, connect
mutation, empty state), plus two screens it depends on that weren't
explicitly ticketed but are part of the same flow: `/neighbor/[id]` (a
match's full profile — connect/accept CTA depending on connection state)
and `/request-sent` (confirmation after sending a request). `/neighbor/[id]`
links to `/chat/[id]` for an already-accepted connection, which doesn't
exist yet — that's a known, expected type error until ticket 005 builds it.

`tsc --noEmit` (aside from the expected `/chat/[id]` gap) and `expo lint`
both clean. Confirmed the typed-routes manifest only regenerates after a
real Metro bundle request (not just `expo start` booting) — re-ran
`expo start --clear` and curled it each time new route files were added.
