# 📘 Project Description

**Working Title:** Neighborhood Connections for Parents & Pet Parents  
**Stage:** MVP (Web-first, Mobile-first)  
**Primary Goal:** Real-world connections, not online engagement

## 1. Product Overview

This project is a neighborhood-based connection platform designed to help:

- Parents of young children (ages 0–5)
- Pet parents (dogs, cats)

Discover and connect with nearby neighbors based on:

- Shared interests (e.g., stroller walks, dog walks, coffee outings)
- Overlapping availability
- Same neighborhood

The platform enables intentional, safe, real-world meetups by lowering the friction of finding like-minded nearby people who already share similar daily routines.

This is **not**:

- A social media platform
- A dating app
- An event marketplace
- A content or feed-driven product

The product prioritizes trust, simplicity, and utility over engagement tricks.

## 2. Problem Statement

Parents of young children and pet parents often:

- Feel socially isolated, especially during early parenting years
- Have limited time and energy to organize social interactions
- Do not know who nearby shares similar routines or interests
- Miss opportunities for meaningful local friendships

Existing solutions (social media groups, messaging apps, forums) are:

- Noisy
- Not neighborhood-specific
- Not intent-driven
- Poor at converting online interactions into offline meetups

## 3. Solution

This platform:

- Matches users only within the same neighborhood
- Uses shared interests + availability overlap to surface relevant connections
- Limits discovery to curated matches, not infinite feeds
- Requires mutual consent before messaging
- Encourages offline interactions over in-app engagement

The app answers one simple question:

> “Who nearby would realistically enjoy doing this with me?”

## 4. Target Users

**Primary Users**

- Parents of young children (0–5 years)
- Pet parents (especially dog owners)

**Secondary Characteristics**

- Value calm, low-pressure social interactions
- Prefer routine-based meetups (walks, coffee, park visits)
- Privacy-conscious
- Mobile-first users

## 5. Core MVP Features

### 5.1 Onboarding

- Neighborhood selection (ZIP / area, no exact address)
- User type: parent, pet parent, or both
- Interests selection (multi-select)
- Availability selection (days + time windows)

### 5.2 Discovery

- Curated list of nearby matches
- Match criteria:
  - Same neighborhood
  - At least one shared interest
  - Overlapping availability
- No infinite scrolling
- No public profiles

### 5.3 Connections

- Send connection request
- Accept or decline
- Messaging unlocked only after acceptance

### 5.4 Messaging

- One-to-one only
- Text-only
- No reactions, no read receipts, no social features

### 5.5 Profile Management

- Edit interests
- Edit availability
- Edit short bio
- Basic privacy controls

## 6. Non-Goals (Important Constraints)

The MVP explicitly does **not** include:

- Public feeds or timelines
- Groups or communities
- Events or RSVPs
- Monetization features (ads, subscriptions) in v1
- Advanced recommendation engines
- Push notifications on the Web App (optional later) — the Mobile App ships with push notifications from v1; see §12
- Location tracking or maps

This keeps scope controlled and quality high.

## 7. Trust & Safety Principles

- Neighborhood-level visibility only
- No exact location sharing
- Messaging gated by mutual consent
- Minimal personal data collection
- Clear user intent (connection, not content)

## 8. Technical Philosophy

**Architecture**

- Monorepo
- Shared domain types between frontend and backend
- Clear separation of concerns
- Simple, testable logic over clever abstractions

**AI-Assisted Development Guidelines**

- Cursor is the primary development tool
- AI is used to:
  - Scaffold code
  - Refactor safely
  - Accelerate iteration
- Human retains architectural authority

**Quality Bar**

- Readable code > clever code
- Explicit logic > hidden magic
- Small functions > large abstractions

## 9. MVP Success Criteria

The MVP is successful if:

- A user can onboard in under 2 minutes
- A user can see relevant nearby matches
- A user can send and accept a connection
- Two users can coordinate a real-world meetup

Nothing else matters at this stage.

## 10. Future (Out of Scope for MVP)

Potential future expansions (**not** to be built now):

- Paid subscriptions
- Local partnerships
- Group meetups
- Calendar integrations
- Moderation tooling
- Growth loops

These are intentionally excluded from current implementation. Native mobile apps were originally on this list but have since moved into current scope — see §12.

## 11. Development Mindset

This product is:

- Utility-first
- Human-centered
- Designed to disappear once it does its job
- Success is measured offline, not in app usage metrics.

## 12. Mobile App (iOS first, Android to follow)

Native mobile is now in scope, superseding its earlier listing as a non-goal. See `GLOSSARY.md` for terms (Mobile App, Mobile Auth Client, Device Token) and `docs/adr/0001`–`0003` for the architecture decisions this summarizes.

- **Stack**: React Native via Expo, in this monorepo at `apps/mobile`, reusing `@neighborhood-connect/types`. Not native Swift — solo developer, React/TypeScript strength, Android committed as a near-term follow-on from the same codebase.
- **v1 scope**: full MVP feature parity (onboarding, discovery, connections, messaging, profile management) ported faithfully, with existing UX rough edges fixed and native idioms adopted. Net-new features beyond the web MVP are deferred past v1.
- **Auth**: same Cognito User Pool as the Web App, through a dedicated Mobile Auth Client (own redirect URI scheme, independent session lifetime).
- **Push notifications**: in scope for v1, via Expo's Push Notification service (not direct AWS SNS/APNs) — delivers new connection requests and new messages.
- **Navigation**: Expo Router.
- **Design**: screens are built code-first as React Native + NativeWind components (no separate static-mockup stage).
- **Offline**: online-required for v1; no offline caching or optimistic UI yet.
- **Observability**: Sentry (Expo SDK) for crash reporting from the start of development.
- **Distribution**: TestFlight beta before public App Store release.
