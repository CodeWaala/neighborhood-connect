# Phase 3: Wire Discovery & Profiles ✅

## Goal

Replace all hardcoded match data and profile data with real API calls. The Discovery page shows actual matches based on shared neighborhood, interests, and availability. Profile pages load from the database.

## Prerequisites

- Phase 2 complete (at least 2 users with profiles, interests, and availability in the same neighborhood)

---

## Tasks

### 3.1 Discovery: Fetch Real Matches ✅

**File:** `apps/web/src/pages/Discovery.tsx`

Replace the hardcoded `matches` array with a React Query call:

```typescript
const { data: matches, isLoading, error } = useQuery({
  queryKey: ['discovery'],
  queryFn: () => discoveryApi.listMatches(),
});
```

**Key changes:**
- Remove the inline `matches: Match[]` constant
- Remove the inline `Match` interface — import from API types
- Add loading state (skeleton cards while data loads)
- Add empty state (already exists, just wire to `matches.length === 0`)
- Add error state (toast or inline error)
- Map API response shape to card props:
  - `user.profile.displayName` → name
  - `user.profile.role` → contextType
  - `user.interests[].interest.label` → sharedInterests
  - `user.availability` → availabilityOverlap (format as "Mornings on weekdays" etc.)

**API response shape (from discovery service):**
```json
{
  "id": "uuid",
  "profile": {
    "displayName": "Sarah",
    "bio": "...",
    "role": "parent",
    "avatarUrl": null,
    "neighborhoodId": "uuid"
  },
  "interests": [
    { "interest": { "id": "uuid", "label": "Stroller walks" } }
  ],
  "availability": [
    { "dayOfWeek": "mon", "availabilityWindow": { "label": "Morning", "timeRange": "6am-12pm" } }
  ]
}
```

---

### 3.2 Profile: Fetch from API ✅

**File:** `apps/web/src/pages/Profile.tsx`

Replace the hardcoded `profilesData` object:

```typescript
const { id } = useParams<{ id: string }>();
const { data: profile, isLoading, error } = useQuery({
  queryKey: ['profile', id],
  queryFn: () => profileApi.getProfileById(id!),
  enabled: !!id,
});
```

**Key changes:**
- Remove the inline `profilesData` Record
- Remove the inline `ProfileData` interface
- Fetch profile with `GET /v1/profile/:id`
- Also fetch the user's interests and availability (may need a combined endpoint or multiple calls)
- Add loading skeleton
- Handle "profile not found" (already has UI)

**Note:** The current `GET /v1/profile/:id` in the API only returns `profile + neighborhood`, not interests/availability. You may need to:
- Option A: Extend the API endpoint to include interests and availability
- Option B: Make separate calls from the frontend to get the user's interests and availability

**Recommended: Option A** — update `profiles.service.ts` `getProfileByUserId` to include related data.

---

### 3.3 Wire Connect Button ✅

**Files:** `apps/web/src/pages/Discovery.tsx`, `apps/web/src/pages/Profile.tsx`

Wire the "Connect" and "Send Connection Request" buttons:

```typescript
const connectMutation = useMutation({
  mutationFn: (recipientId: string) => connectionsApi.createConnection(recipientId),
  onSuccess: (data) => navigate(`/connection-sent/${matchName}`),
  onError: (error) => toast({ title: 'Failed to send request', variant: 'destructive' }),
});
```

**Discovery.tsx changes:**
- Add `onClick` to "Connect" button in `MatchCard`
- Pass the match's user ID to the mutation
- Show loading state on button while sending

**Profile.tsx changes:**
- Wire "Send Connection Request" button to same mutation
- Navigate to `/connection-sent/:name` on success

---

### 3.4 ConnectionSent: Dynamic Data ✅

**File:** `apps/web/src/pages/ConnectionSent.tsx`

Minor update — this page already receives the name via URL params. Just verify it works with the navigate from 3.3. No major changes needed.

---

## API Enhancement Required

### Extend `GET /v1/profile/:id` Response ✅

**File:** `apps/api/src/profiles/profiles.service.ts`

Update `getProfileByUserId` to include interests and availability:

```typescript
async getProfileByUserId(userId: string) {
  return this.prisma.profile.findUnique({
    where: { userId },
    include: {
      neighborhood: true,
      children: true,
      pets: true,
      user: {
        select: {
          interests: { include: { interest: true } },
          availability: { include: { availabilityWindow: true } },
        },
      },
    },
  });
}
```

---

## Verification Checklist

- [x] Discovery page loads matches from the API (not hardcoded)
- [x] Discovery shows correct shared interests and availability for each match
- [x] Empty state shows when no matches exist
- [x] Loading skeleton displays while fetching
- [x] Profile page loads user data from the API
- [x] Profile shows interests, availability, bio, neighborhood
- [x] "Connect" button on Discovery creates a connection in the database
- [x] "Send Connection Request" on Profile creates a connection
- [x] After connecting, user is redirected to ConnectionSent page
- [x] A user doesn't see themselves in discovery results (handled by backend)
- [x] Already-connected users are excluded from discovery (handled by backend)
