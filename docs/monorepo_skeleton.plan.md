---
name: Monorepo Skeleton
overview: Set up a pnpm + Turborepo monorepo with the requested folder layout, baseline documentation, and shared types package, while keeping web/api stack-agnostic for now.
todos: []
---

# Monorepo Structure Plan

## Scope

- Create the directory layout and baseline config for a pnpm + Turborepo monorepo.
- Add initial docs for product truth and developer setup.
- Keep `apps/web` and `apps/api` stack-agnostic with placeholders until a framework is chosen.

## Planned Changes

- Add Turborepo + pnpm workspace configuration at repo root (e.g., `package.json`, `pnpm-workspace.yaml`, `turbo.json`).
- Add `PROJECT.md` and `README.md` templates aligned with the “product truth” and setup/commands guidance.
- Add minimal placeholders in `apps/web` and `apps/api` (README files describing intended app responsibilities and ports).
- Create `packages/types` with a minimal `package.json`, `tsconfig.json`, and index export to hold shared types later.

## Files to Touch

- Root: `PROJECT.md`, `README.md`, `package.json`, `pnpm-workspace.yaml`, `turbo.json`
- Apps: `apps/web/README.md`, `apps/api/README.md`
- Types package: `packages/types/package.json`, `packages/types/tsconfig.json`, `packages/types/src/index.ts`

## Implementation Todos

- `repo-root-config`: Add pnpm workspace and Turborepo config.
- `docs-baseline`: Create `PROJECT.md` and `README.md` templates.
- `apps-placeholders`: Add `apps/web` and `apps/api` placeholder docs.
- `types-package`: Create `packages/types` skeleton with TypeScript exports.
