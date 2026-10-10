.PHONY: api-dev api-setup db-up db-down db-logs prisma-migrate prisma-seed

api-setup:
	cd apps/api && cp -n env.local.example .env || true

db-up:
	cd apps/api && docker compose up -d

db-down:
	cd apps/api && docker compose down

db-logs:
	cd apps/api && docker compose logs -f postgres

prisma-migrate:
	cd apps/api && pnpm prisma:migrate

prisma-seed:
	cd apps/api && pnpm prisma:seed

api-dev:
	cd apps/api && pnpm start:dev
