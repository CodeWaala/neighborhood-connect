# Neighborhood Connect API

NestJS backend for the Neighborhood Connect MVP.

## Local setup

1. Install dependencies from repo root:

```bash
pnpm install
```

2. Create a local env file:

```bash
cp env.local.example .env
```23384778

3. Run Prisma migrations (once DB is ready):

```bash
pnpm prisma migrate dev
```

4. Start the API:

```bash
pnpm start:dev
```

## Notes

- Prisma schema lives in `prisma/schema.prisma`
- Auth will be Cognito Hosted UI with JWT validation
