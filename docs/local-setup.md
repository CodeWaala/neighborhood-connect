# Local Setup

## Requirements

- Node.js 20+
- pnpm 9 (via Corepack)
- Postgres 16 (Homebrew)

Optional:

- Docker Desktop (if you prefer Docker DB)
- Prisma VSCode extension

## One-time setup

```bash
# Node + pnpm
nvm install 20
nvm use 20
corepack enable
corepack prepare pnpm@9.0.0 --activate

# Install repo deps
pnpm install
```

## Local Postgres (Homebrew)

```bash
brew install postgresql@16
brew services start postgresql@16
createdb neighborhood_connect
```

If `brew services` fails, start Postgres manually:

```bash
sudo mkdir -p /opt/homebrew/var/postgresql@16
sudo chown -R "$(whoami)" /opt/homebrew/var/postgresql@16
initdb --locale=C -E utf8 /opt/homebrew/var/postgresql@16
pg_ctl -D /opt/homebrew/var/postgresql@16 -l /opt/homebrew/var/log/postgresql@16.log start
createdb neighborhood_connect
```

## API environment

```bash
cd apps/api
cp env.local.example .env
```

Update `DATABASE_URL` in `.env`:

```
DATABASE_URL="postgresql://$(whoami)@localhost:5432/neighborhood_connect?schema=public"
```

## Prisma

```bash
cd apps/api
pnpm prisma:migrate
pnpm prisma:seed
```

## Run API

```bash
cd apps/api
pnpm start:dev
```

Then visit `http://localhost:3000`.
