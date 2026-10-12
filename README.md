# Neighborhood Connect

This repo is a pnpm + Turborepo monorepo for web, API, and shared packages.

## Requirements

- Node.js 18+
- pnpm 9+

## Install

```
pnpm install
```

## Common commands

```
pnpm dev
pnpm build
pnpm lint
pnpm test
```

## Repo layout

- `apps/web`: web app (Vite + React)
- `apps/api`: API service (NestJS + Prisma)
- `apps/mobile`: Mobile App (React Native + Expo), iOS first — see `PROJECT.md` §12
- `apps/marketing`: marketing site (Next.js)
- `packages/types`: shared TypeScript types
