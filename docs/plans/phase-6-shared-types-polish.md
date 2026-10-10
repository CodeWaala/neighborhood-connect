# Phase 6: Shared Types & Polish ✅

## Goal

Establish type safety across the monorepo with shared TypeScript types. Add UX polish: loading states, error handling, bottom navigation, and protected routes.

## Prerequisites

- Phases 1–5 complete (all pages wired to API)

---

## Tasks

### 6.1 Define Shared Types ✅

**Directory:** `packages/types/src/`

Create shared type definitions used by both the API and the web app:

**`packages/types/src/user.ts`**
```typescript
export interface User {
  id: string;
  email: string | null;
  createdAt: string;
  lastSeenAt: string | null;
}
```

**`packages/types/src/profile.ts`**
```typescript
export type ProfileRole = 'parent' | 'pet' | 'both';

export interface Profile {
  userId: string;
  displayName: string;
  bio: string | null;
  role: ProfileRole;
  neighborhoodId: string;
  avatarUrl: string | null;
  isProfilePublic: boolean;
  updatedAt: string;
  neighborhood?: Neighborhood;
  children?: Child[];
  pets?: Pet[];
}

export interface Child {
  id: string;
  profileId: string;
  ageRange: string;
}

export interface Pet {
  id: string;
  profileId: string;
  petType: string;
  petName: string | null;
}
```

**`packages/types/src/neighborhood.ts`**
```typescript
export interface Neighborhood {
  id: string;
  name: string;
  city: string | null;
  region: string | null;
  postalCode: string | null;
}
```

**`packages/types/src/interest.ts`**
```typescript
export interface Interest {
  id: string;
  label: string;
  category: string | null;
  isActive: boolean;
}

export interface UserInterest {
  userId: string;
  interestId: string;
  interest?: Interest;
}
```

**`packages/types/src/availability.ts`**
```typescript
export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface AvailabilityWindow {
  id: string;
  label: string;
  timeRange: string;
}

export interface UserAvailability {
  userId: string;
  availabilityId: string;
  dayOfWeek: DayOfWeek;
  availabilityWindow?: AvailabilityWindow;
}
```

**`packages/types/src/connection.ts`**
```typescript
export type ConnectionStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

export interface Connection {
  id: string;
  requesterId: string;
  recipientId: string;
  status: ConnectionStatus;
  requestedAt: string;
  respondedAt: string | null;
  requester?: { id: string; profile: ProfileSummary | null };
  recipient?: { id: string; profile: ProfileSummary | null };
}

export interface ProfileSummary {
  displayName: string;
  bio: string | null;
  role: ProfileRole;
  avatarUrl: string | null;
}
```

**`packages/types/src/message.ts`**
```typescript
export interface Message {
  id: string;
  connectionId: string;
  senderId: string;
  body: string;
  createdAt: string;
}
```

**`packages/types/src/api.ts`**
```typescript
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  cursor: string | null;
  hasMore: boolean;
}
```

**`packages/types/src/index.ts`** — barrel export for all types.

---

### 6.2 Use Shared Types in Both Apps ✅

**API (`apps/api`):**
- Add `@neighborhood-connect/types` as a workspace dependency
- Import types in DTOs and service return types
- Ensure API responses match the shared type shapes

**Web (`apps/web`):**
- Add `@neighborhood-connect/types` as a workspace dependency
- Replace all inline interface definitions in pages and API service files
- Use shared types in React Query generic parameters

```typescript
// Before:
interface Match { id: string; name: string; ... }

// After:
import type { DiscoveryMatch } from '@neighborhood-connect/types';
const { data } = useQuery<DiscoveryMatch[]>({ ... });
```

---

### 6.3 Add Loading States ✅

Add skeleton loaders to all pages that fetch data:

| Page | Loading State |
|------|--------------|
| Discovery | 3 skeleton match cards (pulse animation) |
| Profile | Skeleton avatar + text blocks |
| Connections | Skeleton connection cards |
| Messages | Skeleton message bubbles |
| ProfileEdit | Skeleton form fields |

Use the existing `Skeleton` component from shadcn/ui.

Example skeleton card:
```tsx
const MatchCardSkeleton = () => (
  <div className="bg-card border border-border rounded-2xl p-5">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div>
        <Skeleton className="h-5 w-24 mb-1" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <div className="flex gap-2 mb-4">
      <Skeleton className="h-6 w-24 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    <Skeleton className="h-9 w-full rounded-lg" />
  </div>
);
```

---

### 6.4 Add Error Handling ✅

Create a global error handling pattern:

**API error interceptor** (`apps/web/src/api/client.ts`):
- Catch 401 errors → redirect to login
- Catch 404 errors → show "not found" state
- Catch 500 errors → show generic error toast
- Catch network errors → show "offline" toast

**React Query global error handler:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
    mutations: {
      onError: (error) => {
        toast({ title: 'Something went wrong', variant: 'destructive' });
      },
    },
  },
});
```

**Error boundary component:**
```tsx
// apps/web/src/components/ErrorBoundary.tsx
// Catches unhandled React errors and shows a fallback UI
```

---

### 6.5 Add Bottom Navigation ✅

**File:** `apps/web/src/components/BottomNav.tsx` (new)

Create a mobile-first bottom tab bar:

| Tab | Icon | Route | Label |
|-----|------|-------|-------|
| Discover | `Compass` | `/discovery` | Discover |
| Connections | `Users` | `/connections` | Connections |
| Profile | `UserCircle` | `/profile/edit` | Profile |

**Behavior:**
- Fixed to bottom of viewport
- Active tab highlighted with primary color
- Badge on Connections tab showing pending request count
- Hidden on onboarding pages, dev-login, and messages page
- Animate in from bottom on page load

**Integration in App.tsx:**
- Render `<BottomNav />` conditionally based on route

---

### 6.6 Protected Routes ✅

**File:** `apps/web/src/components/ProtectedRoute.tsx` (new)

Create a route guard component:

```tsx
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/dev-login" state={{ from: location }} />;

  return <>{children}</>;
};
```

Apply to all authenticated routes in App.tsx:
```tsx
<Route path="/discovery" element={<ProtectedRoute><Discovery /></ProtectedRoute>} />
<Route path="/connections" element={<ProtectedRoute><Connections /></ProtectedRoute>} />
// etc.
```

**Additional logic:**
- If authenticated but no profile → redirect to `/onboarding`
- If authenticated and has profile → redirect from `/onboarding` to `/discovery`

---

## Verification Checklist

- [x] `packages/types` exports all shared types
- [x] API uses shared types (at least in service return types)
- [x] Web uses shared types (no more inline interfaces)
- [x] All data-fetching pages show skeleton loaders during load
- [x] API errors show toast notifications
- [x] 401 errors redirect to login
- [x] Bottom navigation shows on main pages
- [x] Connections tab shows pending count badge
- [x] Unauthenticated users are redirected to dev-login
- [x] Users without profiles are redirected to onboarding
- [x] Error boundary catches and displays unhandled errors
