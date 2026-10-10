# Phase 5: Wire Profile Edit ✅

## Goal

Make the profile edit page load current data from the API and persist changes back. Users can update their role, interests, availability, and bio.

## Prerequisites

- Phase 2 complete (user has a profile created via onboarding)
- Phase 1 complete (API client and auth context)

---

## Tasks

### 5.1 Load Current Profile on Mount ✅

**File:** `apps/web/src/pages/ProfileEdit.tsx`

Replace all hardcoded initial state with data fetched from the API:

```typescript
const { data: profile, isLoading: profileLoading } = useQuery({
  queryKey: ['myProfile'],
  queryFn: () => profileApi.getMyProfile(),
});

const { data: userInterests, isLoading: interestsLoading } = useQuery({
  queryKey: ['myInterests'],
  queryFn: () => profileApi.getMyProfile(), // interests come with profile
});
```

**Key changes:**
- Remove hardcoded `useState` initial values for `selectedRole`, `childAgeRange`, `petInfo`, `selectedInterests`, `selectedDays`, `selectedTimes`, `bio`
- Populate form state from API data once loaded
- Show a loading skeleton while data is being fetched
- Handle error state (toast + retry option)

**Mapping API data to form state:**
```typescript
// When profile loads:
setSelectedRole(profile.role);                    // 'parent' | 'pet' | 'both'
setBio(profile.bio ?? '');
setChildAgeRange(profile.children?.[0]?.ageRange ?? '');
setPetInfo(profile.pets?.[0] ? `${profile.pets[0].petType}, ${profile.pets[0].petName}` : '');

// When user interests load (from profile include):
setSelectedInterests(profile.user.interests.map(ui => ui.interestId));

// When user availability loads:
const days = [...new Set(profile.user.availability.map(ua => ua.dayOfWeek))];
const times = [...new Set(profile.user.availability.map(ua => ua.availabilityId))];
setSelectedDays(days);
setSelectedTimes(times);
```

---

### 5.2 Fetch Interests & Availability From API ✅

**File:** `apps/web/src/pages/ProfileEdit.tsx`

Replace hardcoded `interestOptions` and `timeWindows` arrays:

```typescript
const { data: allInterests } = useQuery({
  queryKey: ['interests'],
  queryFn: () => interestsApi.listInterests(),
});

const { data: allWindows } = useQuery({
  queryKey: ['availabilityWindows'],
  queryFn: () => availabilityApi.listAvailabilityWindows(),
});
```

**Key changes:**
- Remove the hardcoded `interestOptions` array (with fake IDs like "stroller", "coffee")
- Use real interest objects from API: `{ id: uuid, label: string, category: string }`
- Remove the hardcoded `timeWindows` array
- Use real availability windows from API: `{ id: uuid, label: string, timeRange: string }`
- Keep `days` as a static array (enum values don't come from API)

**Interest rendering update:**
```typescript
// Map API interests to UI with icons
const interestIconMap: Record<string, React.ReactNode> = {
  'Stroller walks': <Baby className="w-4 h-4" />,
  'Coffee outings': <Coffee className="w-4 h-4" />,
  'Park visits': <Trees className="w-4 h-4" />,
  'Dog walks': <Dog className="w-4 h-4" />,
  'Casual chats': <MessageCircle className="w-4 h-4" />,
};

// Render:
allInterests?.map((interest) => (
  <button onClick={() => toggleInterest(interest.id)}>
    {interestIconMap[interest.label] ?? <Sparkles />}
    {interest.label}
  </button>
))
```

---

### 5.3 Save Profile Changes to API ✅

**File:** `apps/web/src/pages/ProfileEdit.tsx`

Replace the `handleSave` function with real API calls:

```typescript
const handleSave = async () => {
  // Validation (keep existing)
  if (selectedInterests.length === 0) { /* ... */ }
  if (selectedDays.length === 0 || selectedTimes.length === 0) { /* ... */ }

  try {
    // 1. Update profile (role, bio)
    await profileApi.updateProfile({
      role: selectedRole,
      bio: bio.trim() || undefined,
    });

    // 2. Replace interests
    await profileApi.replaceInterests(selectedInterests);

    // 3. Replace availability
    // Build entries: each selected day × each selected time window
    const availabilityEntries = selectedDays.flatMap((day) =>
      selectedTimes.map((windowId) => ({
        availabilityId: windowId,
        dayOfWeek: day,
      }))
    );
    await profileApi.replaceAvailability(availabilityEntries);

    // Invalidate cached queries
    queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    queryClient.invalidateQueries({ queryKey: ['discovery'] });

    toast({ title: 'Profile updated!', description: 'Your changes have been saved.' });
    navigate(-1);
  } catch (error) {
    toast({ title: 'Failed to save', description: 'Please try again.', variant: 'destructive' });
  }
};
```

**Key changes:**
- Replace the no-op save with 3 sequential API calls
- Add loading state to save button (disable + spinner while saving)
- Invalidate relevant React Query caches after save
- Handle errors with toast notification

---

## API Enhancement Required

### Extend `GET /v1/profile` to Include Interests & Availability ✅

**File:** `apps/api/src/profiles/profiles.service.ts`

Update `getMyProfile` to also include the user's interests and availability:

```typescript
async getMyProfile(userId: string) {
  const profile = await this.prisma.profile.findUnique({
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

  if (!profile) {
    throw new NotFoundException('Profile not found');
  }

  return profile;
}
```

This ensures a single request gives the ProfileEdit page everything it needs.

---

## Verification Checklist

- [x] Profile edit page loads current role from database
- [x] Profile edit page loads current bio from database
- [x] Profile edit page shows current interests as selected (from database)
- [x] Profile edit page shows current availability days/times as selected
- [x] Interest options come from the API
- [x] Availability windows come from the API
- [x] Changing role and saving updates the database
- [x] Adding/removing interests and saving updates `user_interests` table
- [x] Changing availability and saving updates `user_availability` table
- [x] Bio changes are saved
- [x] Save button shows loading state while saving
- [x] After save, navigating to profile shows updated data
- [x] Discovery results reflect updated interests/availability
