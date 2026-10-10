---
name: web-app-stack-setup
overview: Set up the web app with React/Vite/TS/Tailwind, plus Router, React Query, and React Hook Form.
---

# Web App Stack Setup Plan

## Goals

- Scaffold `apps/web` with Vite + React + TypeScript.
- Configure Tailwind CSS and global styles.
- Add React Router, React Query, and React Hook Form.
- Establish the requested folder structure under `apps/web/src`.
- Create a `docs/` folder for plans and documentation.

## Key Files

- `apps/web/` (Vite app root)
- `apps/web/vite.config.ts` (Tailwind Vite plugin)
- `apps/web/src/main.tsx` (app bootstrap and providers)
- `apps/web/src/styles/index.css` (Tailwind entry)
- `apps/web/src/pages/`, `apps/web/src/components/`, `apps/web/src/hooks/`, `apps/web/src/api/`
- `docs/` (plans and documentation home)
- `turbo.json` (pipeline)

## Proposed Steps

1. **Scaffold app**: Use `pnpm create vite apps/web --template react-ts` and ensure the Vite app runs.
2. **Install deps**: Add `tailwindcss`, `@tailwindcss/vite`, `react-router-dom`, `@tanstack/react-query`, `react-hook-form` in `apps/web`.
3. **Configure Tailwind**:
   - Add the Tailwind Vite plugin in `apps/web/vite.config.ts`.
   - Add Tailwind import in `apps/web/src/styles/index.css` and import it from `apps/web/src/main.tsx`.
4. **Set up routing and providers**:
   - Update `apps/web/src/main.tsx` to wrap the app with `BrowserRouter` and `QueryClientProvider`.
   - Create a simple `pages` route (e.g., `Home.tsx`) to validate routing.
5. **Create folders**: Add the requested directories under `apps/web/src/` and move any starter components as needed.
6. **Create docs folder**: Add `docs/` at repo root and store the plan file there.
7. **Verify scripts**: Ensure `apps/web/package.json` scripts for `dev`, `build`, `preview`, `lint` align with the monorepo workflow.
