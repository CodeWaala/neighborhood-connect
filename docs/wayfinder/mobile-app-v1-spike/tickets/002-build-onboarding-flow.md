---
title: Build Onboarding flow
label: wayfinder:task
status: closed
assignee: claude
---

## Question

Implement the Role → Interests → Availability onboarding screens, mirroring
`apps/web/src/pages/Onboarding*.tsx`, posting the completed profile to the
API on finish. Gate the `(tabs)` navigator behind onboarding completion for
first-time users (a signed-in user without a profile yet should land in
onboarding, not the tabs).

## Blocked by

- [Wire Cognito mobile auth](./001-wire-cognito-mobile-auth.md)

## Resolution

Built all four screens (`onboarding/index`, `role`, `interests`,
`availability`) plus `OnboardingContext` (in-memory only — no
sessionStorage-equivalent persistence, a deliberate RN simplification since
onboarding is a short, forward-only flow). Wired the root layout's
`RootNavigator` to redirect a signed-in user with `hasProfile === false` to
`/onboarding`, and back to `/discovery` once `submitOnboarding()` succeeds.

Built a small shared UI kit along the way (`Button`, `Chip`, `Avatar`,
`Screen`, `OnboardingProgress`, `useThemeColors`) that later tickets should
reuse rather than re-styling from scratch.

**Found and fixed a real toolchain bug, not just app code**: Metro couldn't
resolve `react-native-css-interop/jsx-runtime` (NativeWind's Babel
`jsxImportSource` generates this bare import directly in every screen file),
because pnpm's strict isolation never hoists a dependency's own transitive
deps to where the importing package can see them, and Metro's resolver
doesn't traverse pnpm's `.pnpm` store on its own. Fixed by (a) adding
`config.resolver.unstable_enableSymlinks = true` to `metro.config.js`, and
(b) declaring `react-native-css-interop` as a direct dependency of
`apps/mobile` pinned to the exact version NativeWind resolves
(`0.2.7`) so pnpm symlinks it into `apps/mobile/node_modules`. Verified with
a full `expo start --clear` → "Web Bundled ... (2874 modules)" with zero
resolution errors.

`tsc --noEmit` and `expo lint` both clean.
