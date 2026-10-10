# Phase 7: Production Hardening

## Goal

Replace dev-only shortcuts with production-grade security, validation, observability, and resilience. After this phase, the API is safe to expose to the public internet.

## Prerequisites

- Phases 1–6 complete (fully integrated, locally working MVP)
- AWS account with Cognito user pool created

---

## Tasks

### 7.1 Replace Dev-Login with Cognito Auth Flow

**Scope:** API auth module + Web auth context

#### API Changes

**Files:** `apps/api/src/auth/`

1. **Remove `POST /v1/auth/dev-login`** from production builds (keep behind `NODE_ENV === 'development'` guard)

2. **Update `AuthGuard`** to reject `x-user-id` header in production:
   ```typescript
   if (devUserId && process.env.NODE_ENV === 'development') {
     request.user = { sub: String(devUserId) };
     return true;
   }
   ```

3. **Add Cognito user sync**: When a JWT-authenticated user hits the API for the first time, auto-create a `User` record:
   ```typescript
   // In AuthService or a middleware:
   async ensureUserExists(sub: string, email: string) {
     return this.prisma.user.upsert({
       where: { authSubject: sub },
       update: { lastSeenAt: new Date() },
       create: { authProvider: 'cognito', authSubject: sub, email },
     });
   }
   ```

4. **Update `auth.types.d.ts`** to include Cognito JWT claims

#### Web Changes

**Files:** `apps/web/src/contexts/AuthContext.tsx`, new `apps/web/src/lib/cognito.ts`

1. **Integrate AWS Amplify Auth** (or `amazon-cognito-identity-js`):
   - Configure with Cognito User Pool ID, Client ID, and domain
   - Implement `signIn()` → redirect to Cognito Hosted UI
   - Implement `handleCallback()` → exchange auth code for tokens
   - Implement `signOut()` → revoke tokens, clear session
   - Implement `getAccessToken()` → return current JWT for API calls

2. **Update API client** to use JWT `Authorization: Bearer <token>` instead of `x-user-id` header

3. **Add login page** with "Sign In" button (Cognito Hosted UI redirect)

4. **Add callback page** (`/auth/callback`) to handle Cognito redirect

**Environment variables (web):**
```
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxx
VITE_COGNITO_CLIENT_ID=xxxxx
VITE_COGNITO_DOMAIN=auth.neighborhoodconnect.com
VITE_COGNITO_REDIRECT_URI=http://localhost:5173/auth/callback
```

---

### 7.2 Input Validation Audit

**Scope:** All API DTOs

Ensure every API endpoint has proper `class-validator` decorators on its DTO:

| DTO File | Validators Needed |
|----------|-------------------|
| `profiles.dto.ts` | `@IsString()`, `@IsEnum(ProfileRole)`, `@IsUUID()`, `@IsOptional()`, `@MaxLength(300)` for bio |
| `connections.dto.ts` | `@IsUUID()` for recipientId, `@IsEnum(ConnectionStatus)` for status |
| `messages.dto.ts` | `@IsString()`, `@IsNotEmpty()`, `@MaxLength(2000)` for body |

**Tasks:**
1. Audit all DTOs — add missing `class-validator` decorators
2. Add `class-transformer` `@Transform()` for sanitization (trim strings)
3. Verify `ValidationPipe` is configured with `whitelist: true`, `forbidNonWhitelisted: true` (already done in `main.ts`)
4. Test with invalid payloads to confirm 400 errors are returned

---

### 7.3 Rate Limiting

**File:** `apps/api/src/main.ts` + new middleware

Add rate limiting using `@nestjs/throttler`:

```bash
pnpm add @nestjs/throttler
```

**Configuration:**
```typescript
// app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },   // 10 req/sec
      { name: 'medium', ttl: 60000, limit: 100 }, // 100 req/min
      { name: 'long', ttl: 3600000, limit: 1000 }, // 1000 req/hour
    ]),
    // ...
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
```

**Specific limits:**
- `POST /auth/dev-login`: 5 req/min (prevent abuse)
- `POST /connections`: 20 req/hour (prevent spam)
- `POST /connections/:id/messages`: 60 req/min (reasonable chat rate)
- `GET /discovery`: 30 req/min
- Other endpoints: default limits

---

### 7.4 Structured Logging

**Scope:** API-wide

Replace default NestJS logger with Pino for structured JSON logging:

```bash
pnpm add nestjs-pino pino pino-http pino-pretty
```

**Configuration:**
```typescript
// app.module.ts
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport: process.env.NODE_ENV === 'development'
          ? { target: 'pino-pretty' }
          : undefined,
        // Redact sensitive fields
        redact: ['req.headers.authorization', 'req.headers["x-user-id"]'],
      },
    }),
    // ...
  ],
})
```

**Log important events:**
- User login/logout
- Profile created/updated
- Connection requested/accepted/declined
- Errors with stack traces
- Request/response metadata (method, path, status, duration)

---

### 7.5 Health Check Endpoint

**File:** `apps/api/src/health/` (new module)

Add a health check endpoint using `@nestjs/terminus`:

```bash
pnpm add @nestjs/terminus
```

**Endpoint:** `GET /health` (no auth required, excluded from `/v1` prefix)

Check:
- Database connectivity (Prisma ping)
- Memory usage
- Disk space (optional)

```typescript
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: PrismaHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}
```

---

### 7.6 Global Error Handling

**File:** `apps/api/src/filters/http-exception.filter.ts` (new)

Create a global exception filter to ensure all errors return a consistent shape:

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = 500;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      code = this.getErrorCode(status);
      message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message;
    }

    response.status(status).json({
      error: { code, message },
    });
  }
}
```

Register in `main.ts`:
```typescript
app.useGlobalFilters(new AllExceptionsFilter());
```

---

### 7.7 CORS Locked to Real Domains

**File:** `apps/api/src/main.ts`

Update CORS to use a whitelist of allowed origins:

```typescript
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map(s => s.trim());

app.enableCors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
});
```

**Production env:** `CORS_ORIGINS=https://app.neighborhoodconnect.com`

---

### 7.8 Security Headers (Helmet)

**File:** `apps/api/src/main.ts`

Add Helmet for security headers:

```bash
pnpm add helmet
```

```typescript
import helmet from 'helmet';
app.use(helmet());
```

This adds:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection`
- `Strict-Transport-Security` (HSTS)
- Content Security Policy headers

---

### 7.9 Avatar Upload Implementation

**Files:** `apps/api/src/uploads/` (new module)

Implement the upload endpoints from the API spec:

1. **`POST /v1/uploads/avatar`** — Generate a signed S3 URL for the client to upload to
2. **`POST /v1/uploads/avatar/complete`** — Confirm upload and save the URL to the profile

**Dependencies:**
```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Flow:**
1. Client requests a signed upload URL
2. Client uploads directly to S3 using the signed URL
3. Client confirms completion
4. API saves the S3 URL to `profiles.avatarUrl`

**For local dev:** Use LocalStack S3 or store files locally with a mock service.

---

## Verification Checklist

After Phase 7 is complete, verify:

- [ ] Dev-login is disabled when `NODE_ENV=production`
- [ ] Cognito JWT authentication works end-to-end
- [ ] First-time Cognito users get auto-created in the database
- [ ] All DTOs have proper class-validator decorators
- [ ] Invalid API payloads return 400 with clear error messages
- [ ] Rate limiting blocks excessive requests (test with rapid requests)
- [ ] Logs output structured JSON in production mode
- [ ] Logs show pretty format in development mode
- [ ] Sensitive data (tokens, passwords) are redacted from logs
- [ ] `GET /health` returns 200 with database status
- [ ] All errors return consistent `{ error: { code, message } }` format
- [ ] CORS only allows configured origins
- [ ] Security headers are present in API responses
- [ ] Avatar upload works (at least with mock S3)
