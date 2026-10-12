# NearbyPals mobile (`@neighborhood-connect/mobile`)

iOS + Android client for the `/v1` API, built with Expo (SDK 57, Expo Router).
Plan: [`docs/plans/mobile-app-v1.md`](../../docs/plans/mobile-app-v1.md).

## Run

```bash
pnpm install                       # from the repo root
pnpm --filter @neighborhood-connect/mobile dev
```

Scan the QR code with Expo Go, or press `i` / `a` for a simulator.

## Scripts

| Script | What it does |
|---|---|
| `dev` / `start` | Start the Metro dev server |
| `lint` | `expo lint` (ESLint, `eslint-config-expo`) |
| `typecheck` | `tsc --noEmit` |

## Layout

- `src/app/` — routes (Expo Router); every file is a screen, `_layout.tsx` files are navigators
- `src/theme.ts` — colors (light + dark), Nunito font, type scale, radii; `useTheme()` follows the phone's appearance
- Icons: `lucide-react-native`
- API calls: `@neighborhood-connect/api-client` (shared with web); types: `@neighborhood-connect/types`

## Notes

- pnpm workspace packages resolve in Metro without `node-linker=hoisted` (checked with `expo export` for iOS and Android).
- Bundle ID / package: `com.codewaala.nearbypals` (placeholder — confirm before the first EAS build).
- Add native packages with `npx expo install <pkg>` so versions match the SDK.
