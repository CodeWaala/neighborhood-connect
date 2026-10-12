---
title: Build Profile management screen
label: wayfinder:task
status: closed
assignee: claude
---

## Question

Replace the Profile tab's placeholder: show the user's role/interests/
availability/bio with edit screens for each, plus the privacy control
(visibility in Discovery) and a sign-out action.

## Blocked by

- [Build Onboarding flow](./002-build-onboarding-flow.md)

## Resolution

Built as a hub (`(tabs)/profile.tsx`: identity, tappable rows, privacy
switch, sign-out) plus four focused editors (`edit/role`, `edit/interests`,
`edit/availability`, `edit/about`) — a better native pattern than porting
the web's single long scrolling form. Skipped child-age-range/pet-info
fields from the web's `ProfileEdit.tsx`: checked the web client and those
fields are never actually sent in its `updateProfile` call either (no API
support surfaced), so porting them would've ported a non-functional UI.

Hit a real lint rule along the way: `react-hooks/set-state-in-effect` flags
seeding local editable state from async query data inside a `useEffect`
(cascading-render risk). Fixed by splitting each editor into an outer
component (handles loading) and an inner form component that only mounts
once data is ready, so its `useState` initializes directly from props —
no effect needed. `tsc --noEmit` and `expo lint` clean; verified with a
full `expo start --clear` bundle (2929 modules, zero resolution errors).
