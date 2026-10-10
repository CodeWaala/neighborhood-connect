# Data Model (MVP -> Launch)

## Overview

This model supports:

- Onboarding (role, neighborhood, interests, availability)
- Discovery (matching by neighborhood + overlap)
- Connection requests + accept/decline
- Messaging after mutual acceptance
- Profile management and privacy basics

## Core Entities (High-level)

- `users`: account identity (auth mapped)
- `profiles`: public-facing user info
- `neighborhoods`: normalized location buckets
- `children`: optional child details per profile
- `pets`: optional pet details per profile
- `interests`: canonical interests
- `user_interests`: many-to-many between users and interests
- `availability_windows`: canonical time windows (morning/afternoon/evening)
- `user_availability`: user availability by day and window
- `connections`: mutual connection state between two users
- `messages`: 1:1 messages between connected users

## Mermaid ERD (Detailed)

```mermaid
erDiagram
  users ||--|| profiles : has
  neighborhoods ||--o{ profiles : contains
  profiles ||--o{ children : has
  profiles ||--o{ pets : has

  users ||--o{ user_interests : selects
  interests ||--o{ user_interests : includes
  users ||--o{ user_availability : has
  availability_windows ||--o{ user_availability : includes

  users ||--o{ connections : requester
  users ||--o{ connections : recipient
  connections ||--o{ messages : enables

  users {
    uuid id
    string auth_provider
    string auth_subject
    string email
    timestamp created_at
    timestamp last_seen_at
  }

  profiles {
    uuid user_id
    string display_name
    string bio
    string role
    uuid neighborhood_id
    string avatar_url
    boolean is_profile_public
    timestamp updated_at
  }

  neighborhoods {
    uuid id
    string name
    string city
    string region
    string postal_code
  }

  children {
    uuid id
    uuid profile_id
    string age_range
    timestamp created_at
  }

  pets {
    uuid id
    uuid profile_id
    string pet_type
    string pet_name
    timestamp created_at
  }

  interests {
    uuid id
    string label
    string category
    boolean is_active
  }

  user_interests {
    uuid user_id
    uuid interest_id
    timestamp created_at
  }

  availability_windows {
    uuid id
    string label
    string time_range
  }

  user_availability {
    uuid user_id
    uuid availability_id
    string day_of_week
    timestamp created_at
  }

  connections {
    uuid id
    uuid requester_id
    uuid recipient_id
    string status
    timestamp requested_at
    timestamp responded_at
  }

  messages {
    uuid id
    uuid connection_id
    uuid sender_id
    string body
    timestamp created_at
  }
```

## Plain Text ERD (Fallback)

```
users 1--1 profiles
profiles *--1 neighborhoods
profiles 1--* children
profiles 1--* pets

users *--* interests (via user_interests)
users *--* availability_windows (via user_availability)

users 1--* connections (requester)
users 1--* connections (recipient)
connections 1--* messages
```

## Key Notes

- `users` ties to auth provider (Cognito) with `auth_provider` + `auth_subject`.
- `profiles` are separate to keep auth data minimal and allow privacy controls.
- `children` and `pets` are optional detail tables linked to `profiles`.
- Matching uses shared `interests`, overlapping `user_availability`, and same `neighborhood`.
- `connections` enforces mutual consent before `messages` are visible.

## Status/Enum Suggestions

- `profiles.role`: `parent | pet | both`
- `connections.status`: `pending | accepted | declined | blocked`
- `user_availability.day_of_week`: `mon | tue | wed | thu | fri | sat | sun`
