# 🧪 QA Test Plan — NearbyPals (Neighborhood Connect)

> **Application:** Neighborhood-based connection platform for parents & pet parents  
> **Architecture:** Monorepo — NestJS API (`apps/api`) + Vite React SPA (`apps/web`) + shared types (`packages/types`)  
> **Auth:** Dev-mode `x-user-id` header (no real auth yet)  
> **Date:** 2026-04-19

---

## Table of Contents

1. [Test Environment Setup](#1-test-environment-setup)
2. [Landing Page (Marketing)](#2-landing-page-marketing)
3. [Dev Login](#3-dev-login)
4. [Onboarding Flow](#4-onboarding-flow)
5. [Discovery Page](#5-discovery-page)
6. [Profile View](#6-profile-view)
7. [Connections Page](#7-connections-page)
8. [Messaging](#8-messaging)
9. [Profile Edit](#9-profile-edit)
10. [Bottom Navigation](#10-bottom-navigation)
11. [Route Protection & Guards](#11-route-protection--guards)
12. [Error Handling](#12-error-handling)
13. [Responsive / Mobile-First](#13-responsive--mobile-first)
14. [Cross-Browser](#14-cross-browser)
15. [Multi-User Scenario (E2E)](#15-multi-user-scenario-e2e)

---

## 1. Test Environment Setup

### Prerequisites
- API running: `cd apps/api && pnpm start:dev`
- Web running: `cd apps/web && pnpm dev`
- API URL: `http://localhost:3000/v1`
- Web URL: `http://localhost:5173` (or whichever Vite port)
- **Clean state recommended:** Clear `localStorage` (`nc_user_id`, `nc_email`) and reset DB between major test runs

### Test Users
For multi-user tests, create at least **2 users**:
- **User A** — login with `alice@test.com`
- **User B** — login with `bob@test.com`

---

## 2. Landing Page (Marketing)

**Route:** `/`

| #   | Test Case | Steps | Expected Result | Status |
|-----|-----------|-------|-----------------|--------|
| 2.1 | Page loads correctly | Navigate to `/` | Landing page renders with Header, Hero, HowItWorks, NeighborsPreview, Routines, CTA, and Footer sections | ⬜ |
| 2.2 | Header renders | Inspect header area | "NearbyPals" brand name or logo visible, navigation links present | ⬜ |
| 2.3 | Hero section | Scroll to hero | Headline, description, and CTA button visible. CTA navigates to login/onboarding | ⬜ |
| 2.4 | How It Works section | Scroll down | Step-by-step explanation cards render correctly | ⬜ |
| 2.5 | CTA button | Click the main CTA button | Navigates to `/dev-login` (or appropriate auth entry point) | ⬜ |
| 2.6 | Footer renders | Scroll to bottom | Footer content displays correctly | ⬜ |
| 2.7 | Bottom nav is hidden | Check bottom of viewport | Bottom navigation bar is NOT visible on landing page | ⬜ |

---

## 3. Dev Login

**Route:** `/dev-login`

| #   | Test Case | Steps | Expected Result | Status |
|-----|-----------|-------|-----------------|--------|
| 3.1 | Page renders | Navigate to `/dev-login` | "Developer Login" title, email input, "Continue" button, DEV MODE badge, and privacy note are visible | ⬜ |
| 3.2 | Login with blank email | Leave email empty, click Continue | A new test user is auto-created. Toast "Logged in!" appears. Redirects to `/onboarding` (new user has no profile) | ⬜ |
| 3.3 | Login with email | Enter `alice@test.com`, click Continue | User created/found. Toast shows. Redirects based on profile status | ⬜ |
| 3.4 | Login with existing user (has profile) | Login as a user who completed onboarding | Redirects to `/discovery` | ⬜ |
| 3.5 | Login with existing user (no profile) | Login as a user who has NOT completed onboarding | Redirects to `/onboarding` | ⬜ |
| 3.6 | Enter key submits | Type email and press Enter | Same as clicking Continue — form submits | ⬜ |
| 3.7 | Loading state | Click Continue | Button text changes to "Logging in..." and input is disabled while request is in-flight | ⬜ |
| 3.8 | API unreachable | Stop the API server, then click Continue | Toast displays: "Login failed" with message "Could not reach the API. Is it running?" or similar network error | ⬜ |
| 3.9 | Bottom nav is hidden | Check viewport | Bottom navigation bar is NOT shown on dev-login page | ⬜ |
| 3.10 | Animations | Observe page load | Fade-in-up animations play in sequence (badge → icon → title → description → input → button → privacy note) with staggered delays | ⬜ |

---

## 4. Onboarding Flow

### 4.1 Neighborhood Selection (`/onboarding`)

| #   | Test Case | Steps | Expected Result | Status |
|-----|-----------|-------|-----------------|--------|
| 4.1.1 | Page renders | Navigate to `/onboarding` | "NearbyPals" header, title, neighborhood search input, and Continue button visible | ⬜ |
| 4.1.2 | Search neighborhoods | Type a search term (e.g., "San") | Dropdown shows matching neighborhoods from the API | ⬜ |
| 4.1.3 | Select a neighborhood | Click on a result from dropdown | Neighborhood is selected, shown in input or selection area | ⬜ |
| 4.1.4 | Continue without selection | Do NOT select a neighborhood, click Continue | Button is disabled or nothing happens (validation) | ⬜ |
| 4.1.5 | Continue with selection | Select a neighborhood, click Continue | Navigates to `/onboarding/role` | ⬜ |

### 4.2 Role Selection (`/onboarding/role`)

| #   | Test Case | Steps | Expected Result | Status |
|-----|-----------|-------|-----------------|--------|
| 4.2.1 | Page renders | Navigate to `/onboarding/role` | Three role cards visible: "Parent of young child", "Pet parent", "Both" | ⬜ |
| 4.2.2 | Select a role | Click "Pet parent" | Card highlights with primary border and background. Others remain unselected | ⬜ |
| 4.2.3 | Switch role | Select "Parent", then select "Both" | "Parent" unselects, "Both" highlights | ⬜ |
| 4.2.4 | Continue without role | Do NOT select any role, click Next | Button is disabled | ⬜ |
| 4.2.5 | Continue with role | Select a role, click Next | Navigates to `/onboarding/interests` | ⬜ |
| 4.2.6 | Card animations | Observe page load | Cards fade in with staggered delays | ⬜ |

### 4.3 Interests Selection (`/onboarding/interests`)

| #   | Test Case | Steps | Expected Result | Status |
|-----|-----------|-------|-----------------|--------|
| 4.3.1 | Page renders | Navigate to `/onboarding/interests` | Title "What do you enjoy?", interest chips loaded from API | ⬜ |
| 4.3.2 | Loading state | Observe during API fetch | Skeleton chips (5 pulse placeholders) shown while loading | ⬜ |
| 4.3.3 | Interests display | After load | Chips show with icons: Stroller walks, Coffee outings, Park visits, Dog walks, Casual chats (or whatever API returns) | ⬜ |
| 4.3.4 | Select interests | Click "Coffee outings" and "Dog walks" | Both chips highlight, checkmark icon appears, counter shows "2 selected" | ⬜ |
| 4.3.5 | Deselect interest | Click a selected chip again | Chip un-highlights, counter decrements | ⬜ |
| 4.3.6 | Continue without interests | Do not select any, click Next | Button is disabled | ⬜ |
| 4.3.7 | Continue with interests | Select ≥1, click Next | Navigates to `/onboarding/availability` | ⬜ |
| 4.3.8 | API error | Simulate API failure | Error message: "Failed to load interests. Please refresh and try again." | ⬜ |

### 4.4 Availability Selection (`/onboarding/availability`)

| #   | Test Case | Steps | Expected Result | Status |
|-----|-----------|-------|-----------------|--------|
| 4.4.1 | Page renders | Navigate to `/onboarding/availability` | Days of week buttons + time window options (Morning, Afternoon, Evening) visible | ⬜ |
| 4.4.2 | Select days | Click "Mon", "Wed", "Fri" | Days highlight on selection | ⬜ |
| 4.4.3 | Select time windows | Click "Morning" and "Afternoon" | Time windows highlight | ⬜ |
| 4.4.4 | Finish without selection | No days/windows selected, click Finish | Button is disabled or validation prevents submission | ⬜ |
| 4.4.5 | Complete onboarding | Select days + windows, click Finish | Profile is created via API. User is redirected to `/discovery`. Auth context updates `hasProfile` to `true` | ⬜ |
| 4.4.6 | API error on submit | Simulate API failure | Error toast shown, user stays on page | ⬜ |

### 4.5 Onboarding State Persistence

| #   | Test Case | Steps | Expected Result | Status |
|-----|-----------|-------|-----------------|--------|
| 4.5.1 | Navigate back | Go to interests, then click browser back | Role page shows previously selected role | ⬜ |
| 4.5.2 | Navigate forward | From role, click Next again | Interests page shows previously selected interests | ⬜ |
| 4.5.3 | Context isolation | Open app in new tab as different user | Onboarding state is separate per session | ⬜ |

---

## 5. Discovery Page

**Route:** `/discovery`

| #   | Test Case | Steps | Expected Result | Status |
|-----|-----------|-------|-----------------|--------|
| 5.1 | Page renders | Navigate to `/discovery` | Page title "Discover Neighbors" (or similar), match cards displayed | ⬜ |
| 5.2 | Loading state | Observe initial load | 3 skeleton match cards with pulse animation | ⬜ |
| 5.3 | Match card content | Inspect a match card | Shows: avatar/initial, display name, role badge, bio excerpt, shared interests chips, availability summary | ⬜ |
| 5.4 | Interest icons | Check interest chips on cards | Icons render for known interests (Stroller walks → Baby icon, Dog walks → Dog icon, etc.) | ⬜ |
| 5.5 | Availability formatting | Check availability text | Human-readable format (e.g., "Mon, Wed — Morning, Afternoon") | ⬜ |
| 5.6 | Connect button | Click "Connect" on a match card | Connection request sent via API. Button shows loading state. On success, navigates to `/connection-sent/:name` | ⬜ |
| 5.7 | Connect error | Simulate API failure on connect | Error toast shown with descriptive message | ⬜ |
| 5.8 | Duplicate connect | Try connecting to someone you already sent a request to | Error handled gracefully (toast or button disabled) | ⬜ |
| 5.9 | Empty state | Login as a user with no matches | Empty state UI shows with invite/explanation, not a blank page | ⬜ |
| 5.10 | View profile from card | Click on a user's name/avatar | Navigates to `/profile/:id` | ⬜ |
| 5.11 | Connected users excluded | Accept a connection, return to discovery | That user no longer appears in the match list | ⬜ |

---

## 6. Profile View

**Route:** `/profile/:id`

| #   | Test Case | Steps | Expected Result | Status |
|-----|-----------|-------|-----------------|--------|
| 6.1 | Page renders | Navigate to `/profile/:id` | Profile page shows: avatar, name, role, bio, neighborhood, interests, availability | ⬜ |
| 6.2 | Loading state | Observe during fetch | Skeleton avatar + text blocks (ProfileSkeleton component) | ⬜ |
| 6.3 | Interest chips display | Check interests section | All user interests shown with appropriate icons | ⬜ |
| 6.4 | Availability display | Check availability section | Days expanded to full names (mon → Monday), time windows listed | ⬜ |
| 6.5 | Connect button (not connected) | View a user you're not connected to | "Connect" button visible. Clicking sends a connection request | ⬜ |
| 6.6 | Already connected | View a profile of someone you're connected to | Connect button shows appropriate state (e.g., "Connected" or "Pending") | ⬜ |
| 6.7 | Own profile | Navigate to your own profile ID | Should either redirect to `/profile/edit` or show profile without connect button | ⬜ |
| 6.8 | Non-existent profile | Navigate to `/profile/nonexistent-id` | Error state or "Not found" message | ⬜ |
| 6.9 | Back navigation | Click back | Returns to previous page (Discovery or Connections) | ⬜ |

---

## 7. Connections Page

**Route:** `/connections`

| #   | Test Case | Steps | Expected Result | Status |
|-----|-----------|-------|-----------------|--------|
| 7.1 | Page renders | Navigate to `/connections` | Page with tabs/sections for: Pending Requests, Sent Requests, Active Connections | ⬜ |
| 7.2 | Loading state | Observe during fetch | Skeleton connection cards | ⬜ |
| 7.3 | Pending requests display | Have User B send a request to User A. Login as User A | Pending request card shows User B's name, role, avatar, and Accept/Decline buttons | ⬜ |
| 7.4 | Accept a request | Click "Accept" on a pending request | Request moves to Active Connections. Toast confirmation shown. Query cache invalidated | ⬜ |
| 7.5 | Decline a request | Click "Decline" on a pending request | Request removed from list. Toast shown | ⬜ |
| 7.6 | Sent requests display | Send a connection request, view connections | Sent request card visible showing recipient's name + "Pending" status | ⬜ |
| 7.7 | Active connections | Accept a connection | Active connection card shows with message/chat action | ⬜ |
| 7.8 | Navigate to messages | Click message action on an active connection | Navigates to `/messages/:connectionId` | ⬜ |
| 7.9 | Navigate to profile | Click on a connection's avatar/name | Navigates to `/profile/:id` | ⬜ |
| 7.10 | Empty state | Login as user with no connections | Empty state component renders with call-to-action to discover neighbors | ⬜ |
| 7.11 | Mutation loading state | Click Accept/Decline | Button shows loading/spinner while API call is in-flight | ⬜ |
| 7.12 | Time ago display | Check request timestamps | Shows relative time (e.g., "2 hours ago", "3 days ago") | ⬜ |
| 7.13 | Role icons | Check connection cards | Correct icon for role: Baby (parent), Dog (pet), Heart (both) | ⬜ |

---

## 8. Messaging

**Route:** `/messages/:connectionId`

| #   | Test Case | Steps | Expected Result | Status |
|-----|-----------|-------|-----------------|--------|
| 8.1 | Page renders | Navigate to `/messages/:connectionId` | Chat interface with message list, input field, send button, and back arrow | ⬜ |
| 8.2 | Loading state | Observe during fetch | Skeleton message bubbles | ⬜ |
| 8.3 | Load existing messages | Open a conversation with messages | Previous messages display in chronological order | ⬜ |
| 8.4 | Message alignment | Check message bubbles | Own messages align right (different styling), other user's messages align left | ⬜ |
| 8.5 | Send a message | Type "Hello!" and click Send | Message appears in the list immediately. Input clears. API call succeeds | ⬜ |
| 8.6 | Send with Enter key | Type a message and press Enter | Message sends (same as clicking Send button) | ⬜ |
| 8.7 | Shift+Enter for newline | Type text, press Shift+Enter | Newline inserted in input, message does NOT send | ⬜ |
| 8.8 | Empty message prevention | Click Send with empty input | Nothing happens — empty messages are not sent | ⬜ |
| 8.9 | Auto-scroll | Send multiple messages | Chat scrolls to bottom automatically when new messages arrive | ⬜ |
| 8.10 | Timestamp display | Check message times | Times formatted properly (e.g., "2:30 PM") | ⬜ |
| 8.11 | Back navigation | Click back arrow | Navigates back to `/connections` | ⬜ |
| 8.12 | Privacy note | Check UI | Shield icon with note about private messaging | ⬜ |
| 8.13 | Send error | Simulate API failure | Error toast shown, message is not lost from input | ⬜ |
| 8.14 | Invalid connectionId | Navigate to `/messages/invalid-id` | Error state or redirect | ⬜ |
| 8.15 | Bottom nav hidden | Check viewport | Bottom navigation is NOT visible on messages page | ⬜ |

---

## 9. Profile Edit

**Route:** `/profile/edit`

| #   | Test Case | Steps | Expected Result | Status |
|-----|-----------|-------|-----------------|--------|
| 9.1 | Page renders | Navigate to `/profile/edit` | Form pre-populated with current profile data: name, bio, role, interests, availability | ⬜ |
| 9.2 | Loading state | Observe during fetch | ProfileEditSkeleton shows skeleton form fields | ⬜ |
| 9.3 | Edit display name | Change name to "New Name" | Input updates | ⬜ |
| 9.4 | Edit bio | Change bio text | Textarea updates | ⬜ |
| 9.5 | Change role | Select a different role card | Role card highlights, previous unselects | ⬜ |
| 9.6 | Toggle interests | Click interest chips to add/remove | Chips toggle selected state | ⬜ |
| 9.7 | Toggle availability days | Click day buttons | Days toggle selected state | ⬜ |
| 9.8 | Toggle time windows | Click time window chips | Windows toggle selected state | ⬜ |
| 9.9 | Save changes | Click Save | API calls made (PATCH profile, PUT interests, PUT availability). Success toast shown | ⬜ |
| 9.10 | Save loading state | Click Save | Button shows loading spinner, form fields disabled during save | ⬜ |
| 9.11 | Save error | Simulate API failure | Error toast shown, form data preserved | ⬜ |
| 9.12 | Validation — empty name | Clear display name, try to save | Validation prevents submission | ⬜ |
| 9.13 | Validation — no interests | Deselect all interests, try to save | Validation prevents submission or shows warning | ⬜ |
| 9.14 | Cancel / Navigate away | Edit fields then navigate away without saving | Changes are not persisted (no accidental saves) | ⬜ |
| 9.15 | Reload preserves data | Save changes, refresh page | Saved data loads correctly from API | ⬜ |

---

## 10. Bottom Navigation

**Component:** `BottomNav.tsx`

| #   | Test Case | Steps | Expected Result | Status |
|-----|-----------|-------|-----------------|--------|
| 10.1 | Visible on authenticated pages | Login, go to `/discovery` | Bottom nav with 3 tabs: Discover, Connections, Profile | ⬜ |
| 10.2 | Active tab highlighting | Navigate between tabs | Active tab is highlighted with primary color, bold text, and top indicator dot | ⬜ |
| 10.3 | Discover tab navigation | Click "Discover" tab | Navigates to `/discovery` | ⬜ |
| 10.4 | Connections tab navigation | Click "Connections" tab | Navigates to `/connections` | ⬜ |
| 10.5 | Profile tab navigation | Click "Profile" tab | Navigates to `/profile/edit` | ⬜ |
| 10.6 | Pending count badge | Have pending connection requests | Red badge shows number on Connections tab icon | ⬜ |
| 10.7 | Badge overflow | Have 10+ pending requests | Badge shows "9+" | ⬜ |
| 10.8 | Badge updates | Accept all pending requests, check badge | Badge disappears when count reaches 0 | ⬜ |
| 10.9 | Hidden on landing page | Go to `/` | Bottom nav NOT visible | ⬜ |
| 10.10 | Hidden on dev-login | Go to `/dev-login` | Bottom nav NOT visible | ⬜ |
| 10.11 | Hidden on onboarding | Go to `/onboarding/*` | Bottom nav NOT visible on any onboarding step | ⬜ |
| 10.12 | Hidden on messages | Go to `/messages/:id` | Bottom nav NOT visible | ⬜ |
| 10.13 | Hidden on connection-sent | Go to `/connection-sent/:name` | Bottom nav NOT visible | ⬜ |
| 10.14 | Profile pages → Discover active | View `/profile/:id` (not edit) | Discover tab appears active (special highlight logic) | ⬜ |
| 10.15 | Fade-in animation | Login and navigate to discovery | Bottom nav animates in from bottom | ⬜ |

---

## 11. Route Protection & Guards

**Component:** `ProtectedRoute.tsx`

| #   | Test Case | Steps | Expected Result | Status |
|-----|-----------|-------|-----------------|--------|
| 11.1 | Unauthenticated → login redirect | Clear localStorage, navigate to `/discovery` | Redirected to `/dev-login` with `from` state preserved | ⬜ |
| 11.2 | Unauthenticated → all protected routes | Try `/connections`, `/profile/edit`, `/messages/123` | All redirect to `/dev-login` | ⬜ |
| 11.3 | Auth loading state | Simulate slow session validation | Loading spinner shown (Loader2 icon + "Loading…" text) | ⬜ |
| 11.4 | Authenticated, no profile → onboarding | Login as user without profile, navigate to `/discovery` | Redirected to `/onboarding` | ⬜ |
| 11.5 | Authenticated with profile → allowed | Login as user with profile, navigate to `/discovery` | Page renders normally | ⬜ |
| 11.6 | Session expiry (401) | Make API return 401 on any request | localStorage cleared, redirected to `/dev-login` | ⬜ |
| 11.7 | Already authenticated → skip login | Login, then navigate to `/dev-login` | Should redirect to `/discovery` (or stay if already at login) | ⬜ |

---

## 12. Error Handling

| #   | Test Case | Steps | Expected Result | Status |
|-----|-----------|-------|-----------------|--------|
| 12.1 | Error boundary — render crash | Trigger an unhandled React render error | ErrorBoundary fallback shows: warning icon, "Something went wrong", error message, "Try Again" + "Go Home" buttons | ⬜ |
| 12.2 | Error boundary — Try Again | Click "Try Again" on error boundary | Error state resets, component retries render | ⬜ |
| 12.3 | Error boundary — Go Home | Click "Go Home" on error boundary | Navigates to `/` | ⬜ |
| 12.4 | API 404 error | Access a non-existent profile | Graceful "not found" state shown | ⬜ |
| 12.5 | API 500 error | Simulate server error | Error toast with "Something went wrong" message | ⬜ |
| 12.6 | Network error (offline) | Disconnect network, trigger API call | Toast: "Unable to reach the server. Please check your connection." | ⬜ |
| 12.7 | 401 auto-redirect | API returns 401 on any request | Clears auth data from localStorage, redirects to `/dev-login` | ⬜ |
| 12.8 | React Query retry | API fails once then succeeds | Query retries once (configured `retry: 1`) and succeeds on second attempt | ⬜ |
| 12.9 | 404 page | Navigate to `/this-page-does-not-exist` | NotFound page renders: "404", "Oops! Page not found", link to Home | ⬜ |
| 12.10 | 404 console logging | Check console on 404 route | `console.error` logs the attempted path | ⬜ |

---

## 13. Responsive / Mobile-First

| #   | Test Case | Steps | Expected Result | Status |
|-----|-----------|-------|-----------------|--------|
| 13.1 | Mobile viewport (375px) | Resize browser to 375px width | All pages render correctly, no horizontal scroll, content fills width | ⬜ |
| 13.2 | Tablet viewport (768px) | Resize to 768px | Layout adjusts, content centered with max-width constraints | ⬜ |
| 13.3 | Desktop viewport (1280px) | Resize to 1280px | Content centered, max-width applied (max-w-md / max-w-lg) | ⬜ |
| 13.4 | Bottom nav on mobile | Mobile viewport | Bottom nav is usable, buttons have adequate tap targets | ⬜ |
| 13.5 | Onboarding cards on mobile | Mobile viewport, role selection | Cards stack vertically, no overflow | ⬜ |
| 13.6 | Interest chips wrapping | Narrow viewport, interest selection | Chips wrap to new lines properly | ⬜ |
| 13.7 | Message input on mobile | Mobile, open messages | Input field and send button visible, keyboard doesn't hide input | ⬜ |
| 13.8 | Long text handling | Submit profile with very long bio | Text truncates or wraps gracefully, no layout breakage | ⬜ |
| 13.9 | Touch interactions | Mobile/tablet | All interactive elements respond to touch, hover effects don't persist | ⬜ |

---

## 14. Cross-Browser

| #   | Test Case | Steps | Expected Result | Status |
|-----|-----------|-------|-----------------|--------|
| 14.1 | Chrome (latest) | Full flow test | All functionality works | ⬜ |
| 14.2 | Safari (latest) | Full flow test | All functionality works, CSS animations render | ⬜ |
| 14.3 | Firefox (latest) | Full flow test | All functionality works | ⬜ |
| 14.4 | Edge (latest) | Full flow test | All functionality works | ⬜ |
| 14.5 | Safari iOS | Mobile Safari on iPhone | Full flow works, bottom nav doesn't overlap safe area | ⬜ |

---

## 15. Multi-User Scenario (E2E)

> **Goal:** Validate the core happy path end-to-end with two users simulating a real-world meetup coordination.

### Setup
1. Open **Browser Window 1** → Login as `alice@test.com`
2. Open **Browser Window 2** (or incognito) → Login as `bob@test.com`

### Steps

| #   | Step | Actor | Action | Expected | Status |
|-----|------|-------|--------|----------|--------|
| 15.1 | Onboard Alice | Alice | Complete onboarding: neighborhood, role=parent, interests=[Stroller walks, Coffee outings], availability=[Mon+Wed mornings] | Profile created, redirected to Discovery | ⬜ |
| 15.2 | Onboard Bob | Bob | Complete onboarding: same neighborhood, role=pet, interests=[Dog walks, Coffee outings], availability=[Mon+Thu mornings] | Profile created, redirected to Discovery | ⬜ |
| 15.3 | Alice discovers Bob | Alice | Open Discovery page | Bob's card appears (shared interest: Coffee outings, overlapping availability: Mon morning) | ⬜ |
| 15.4 | Alice sends request | Alice | Click "Connect" on Bob's card | Redirected to Connection Sent page showing Bob's name | ⬜ |
| 15.5 | Connection sent page | Alice | View the page | Shows success animation, "What happens next?" explanation, "Back to Matches" button | ⬜ |
| 15.6 | Bob sees pending | Bob | Navigate to Connections page | Pending request from Alice visible with Accept/Decline | ⬜ |
| 15.7 | Badge shows on Bob's nav | Bob | Check bottom nav | Connections tab shows "1" badge | ⬜ |
| 15.8 | Bob accepts | Bob | Click "Accept" on Alice's request | Connection moves to Active. Toast shown. Badge disappears | ⬜ |
| 15.9 | Both see active | Both | Check Connections page | Both Alice and Bob see each other under Active Connections | ⬜ |
| 15.10 | Bob opens chat | Bob | Click message action on Alice's connection | Opens Messages page | ⬜ |
| 15.11 | Bob sends message | Bob | Type "Hey! Want to grab coffee on Monday?" and send | Message appears in chat | ⬜ |
| 15.12 | Alice sees message | Alice | Open Messages via Connections page | Bob's message visible in the conversation | ⬜ |
| 15.13 | Alice replies | Alice | Type "Sure! Morning at the park?" and send | Reply appears in chat for both users (on refresh) | ⬜ |
| 15.14 | Bob no longer in Discovery | Alice | Refresh Discovery page | Bob's card should no longer appear (already connected) | ⬜ |
| 15.15 | Profile view from connection | Alice | Click Bob's name in connections | Bob's full profile displays correctly | ⬜ |

---

## Connection Sent Page

**Route:** `/connection-sent/:name`

| #   | Test Case | Steps | Expected Result | Status |
|-----|-----------|-------|-----------------|--------|
| CS.1 | Page renders | Navigate after sending connection | Success heart animation, "Request sent! 🎉", recipient name shown | ⬜ |
| CS.2 | Name parameter | Send connection to "Sarah" | Page shows "Sarah will be notified" | ⬜ |
| CS.3 | Missing name param | Navigate to `/connection-sent/` without name | Fallback text "Your request is on its way" | ⬜ |
| CS.4 | What happens next | Inspect explanation card | Three steps: review, acceptance, messaging — each with icons and descriptions | ⬜ |
| CS.5 | Back to Matches button | Click "Back to Matches" | Navigates to `/discovery` | ⬜ |
| CS.6 | Bottom nav hidden | Check viewport | Bottom navigation is NOT visible | ⬜ |
| CS.7 | Animations | Observe page load | Staggered fade-in-up animations play in sequence | ⬜ |

---

## Summary

| Area | Total Tests | Priority |
|------|-------------|----------|
| Landing Page | 7 | Low |
| Dev Login | 10 | High |
| Onboarding Flow | 17 | High |
| Discovery | 11 | High |
| Profile View | 9 | Medium |
| Connections | 13 | High |
| Messaging | 15 | High |
| Profile Edit | 15 | Medium |
| Bottom Navigation | 15 | Medium |
| Route Protection | 7 | High |
| Error Handling | 10 | Medium |
| Responsive | 9 | Medium |
| Cross-Browser | 5 | Low |
| Multi-User E2E | 15 | **Critical** |
| Connection Sent | 7 | Low |
| **Total** | **165** | — |

> [!IMPORTANT]
> The **Multi-User E2E scenario (Section 15)** is the most important test suite. It validates the core product promise: two neighbors discovering each other, connecting, and coordinating a real-world meetup. If this flow is broken, the app fails its primary purpose.

> [!TIP]
> **Recommended testing order:**
> 1. Start with Section 15 (E2E) to catch critical flow breaks
> 2. Then Sections 3–4 (Login + Onboarding) to validate entry points
> 3. Then Sections 5, 7, 8 (Discovery, Connections, Messaging) for feature depth
> 4. Then Sections 10–12 (Navigation, Guards, Errors) for polish
> 5. Finally Sections 13–14 (Responsive, Cross-Browser) for compatibility
