# Development Plan (Backend + Infra)

## Decisions Locked

- Marketing site: Next.js (SSR/SSG)
- App: Vite SPA on S3 + CloudFront
- Backend: NestJS
- Database: PostgreSQL with Prisma
- Auth: Cognito Hosted UI
- IaC: Terraform
- Domains:
  - Production: `neighborhoodconnect.com`, `app.neighborhoodconnect.com`, `api.neighborhoodconnect.com`, `auth.neighborhoodconnect.com`
  - Staging: `staging.neighborhoodconnect.com`, `app.staging.neighborhoodconnect.com`, `api.staging.neighborhoodconnect.com`, `auth.staging.neighborhoodconnect.com`
  - Dev: `dev.neighborhoodconnect.com`, `app.dev.neighborhoodconnect.com`, `api.dev.neighborhoodconnect.com`, `auth.dev.neighborhoodconnect.com`

## Phased Execution (Recommended Order)

### Phase 1: Backend Foundation

- Scaffold NestJS app with module boundaries:
  - `auth`, `users`, `profiles`, `interests`, `availability`, `neighborhoods`, `connections`, `messages`
- Add Prisma + initial schema aligned to `docs/data-model.md`
- Add migrations, seed data for interests and availability windows
- Implement Cognito JWT validation middleware/guard

### Phase 2: Core MVP APIs

- Profile creation/update
- Discovery endpoint (neighborhood + overlap rules)
- Connection request/accept/decline
- Messaging (after accepted connection)

### Phase 3: Marketing Site (Next.js)

- SEO pages: landing, how it works, safety, privacy, cities
- Add structured metadata, OpenGraph, sitemap

### Phase 4: Infrastructure (Terraform)

- VPC, subnets, security groups
- ECS Fargate (API) + ALB
- RDS Postgres
- S3 + CloudFront (app)
- Cognito + domain config

### Phase 5: Hardening + QA

- Observability (CloudWatch logs/metrics)
- Rate limiting and basic abuse prevention
- Staging deploy with smoke tests

## Next Action (If you want me to start)

- Scaffold NestJS backend and Prisma schema
