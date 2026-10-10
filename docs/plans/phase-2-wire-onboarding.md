# Phase 2: Wire Onboarding Flow ✅

## Goal

Make the 4-step onboarding flow (neighborhood → role → interests → availability) persist data to the backend. On completion, a real profile is created in the database.

## Prerequisites

- Phase 1 complete (API client, auth context, seeded neighborhoods)
- User is logged in via dev-login

---

## Tasks

### 2.1 Create Onboarding State Manager ✅

**File:** `apps/web/src/contexts/OnboardingContext.tsx`

Create a React context (or zustand store) to hold onboarding data across the 4 steps:

```typescript
type OnboardingState = {
  neighborhoodId: string | null;
  neighborhoodName: string | null;
  role: 'parent' | 'pet' | 'both' | null;
  interestIds: string[];
  availability: { availabilityId: string; dayOfWeek: string }[];
  displayName: string;
  bio: string;
};
```

Key behaviors:
- State resets if user restarts onboarding
- State persists to `sessionStorage` so back-button works
- Provides `setNeighborhood()`, `setRole()`, `setInterests()`, `setAvailability()` methods
- Provides `submitOnboarding()` that calls the API (task 2.6)

---

### 2.2 Onboarding Step 1: Neighborhood Search ✅

**File:** `apps/web/src/pages/Onboarding.tsx`

Replace the free-text input with a **search-as-you-type** component:
- On input change (debounced 300ms), call `GET /v1/neighborhoods/search?query=<input>`
- Display results as a dropdown list
- User selects a neighborhood → saves `neighborhoodId` and `neighborhoodName` to onboarding context
- "Continue" button enabled only when a neighborhood is selected

**Key changes:**
- Remove the hardcoded `neighborhood` string state
- Add `useQuery` or `useState` + `useEffect` for search results
- Add a dropdown/combobox for neighborhood selection

---

### 2.3 Onboarding Step 2: Role Selection ✅

**File:** `apps/web/src/pages/OnboardingRole.tsx`

Wire the role selection to onboarding context:
- On role card click, save to `onboardingContext.setRole()`
- "Continue" navigates to `/onboarding/interests`
- If role is `parent` or `both`, optionally show child age range input
- If role is `pet` or `both`, optionally show pet type input

**Key changes:**
- Replace local state with onboarding context
- Pre-select role if user navigates back

---

### 2.4 Onboarding Step 3: Interests ✅

**File:** `apps/web/src/pages/OnboardingInterests.tsx`

Replace hardcoded interest options with API data:
- On mount, call `GET /v1/interests` via React Query
- Render interest cards dynamically from API response
- Selected interest IDs saved to onboarding context
- "Continue" requires at least 1 interest selected

**Key changes:**
- Remove hardcoded `interests` array
- Add `useQuery('interests', listInterests)` hook
- Show loading skeleton while interests load

---

### 2.5 Onboarding Step 4: Availability ✅

**File:** `apps/web/src/pages/OnboardingAvailability.tsx`

Replace hardcoded availability options with API data:
- On mount, call `GET /v1/availability/windows` via React Query
- Days remain static (`mon`–`sun`) as they are enum values
- Time windows come from the API (Morning, Afternoon, Evening with their IDs)
- Selected combinations saved to onboarding context as `{ availabilityId, dayOfWeek }[]`

**Key changes:**
- Remove hardcoded `timeWindows` array
- Fetch windows from the API
- Build the availability entries array from selected days × selected windows

---

### 2.6 Submit Onboarding to API ✅

**Triggered from:** Final step "Complete" button (OnboardingAvailability.tsx)

On completion, make 3 sequential API calls:

1. **`PATCH /v1/profile`** — Create profile:
   ```json
   {
     "displayName": "<name>",
     "role": "parent|pet|both",
     "neighborhoodId": "<uuid>",
     "bio": "<optional>"
   }
   ```

2. **`PUT /v1/profile/interests`** — Set interests:
   ```json
   { "interestIds": ["<uuid>", "<uuid>"] }
   ```

3. **`PUT /v1/profile/availability`** — Set availability:
   ```json
   {
     "availability": [
       { "availabilityId": "<uuid>", "dayOfWeek": "mon" },
       { "availabilityId": "<uuid>", "dayOfWeek": "wed" }
     ]
   }
   ```

On success: navigate to `/discovery`.
On error: show toast with error message, stay on current step.

---

## Verification Checklist

- [x] Neighborhood search returns results from the database
- [x] Selecting a neighborhood persists across steps (back button works)
- [x] Role selection persists across steps
- [x] Interests load from the API (not hardcoded)
- [x] Availability windows load from the API
- [x] Completing onboarding creates a profile in the database
- [x] Interests are saved to `user_interests` table
- [x] Availability is saved to `user_availability` table
- [x] After onboarding, user is redirected to `/discovery`
- [x] Re-visiting `/onboarding` after profile creation redirects to `/discovery`


