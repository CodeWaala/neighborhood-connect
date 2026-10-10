# API Endpoints (MVP -> Launch)

## Overview

Base URL: `/v1`

Principles:

- REST-first, JSON only
- Auth required for all user-facing endpoints (JWT/Cognito)
- No public profiles or feeds
- Messaging only after connection acceptance

Auth header:

- `Authorization: Bearer <token>` (Cognito)
- Dev-only: `x-user-id` (for local testing)

## Auth & Session

- `POST /v1/auth/login` - exchange auth code for session
- `POST /v1/auth/logout` - revoke session
- `GET /v1/auth/me` - current user + profile summary
- `POST /v1/auth/dev-login` - dev-only user creation (remove once Cognito guard is live)

## Users & Profiles

- `GET /v1/profile` - get my profile
- `PATCH /v1/profile` - update my profile (name, bio, role, avatar, neighborhood)
- `GET /v1/profile/:id` - get profile by id (only if connected or in discovery context)

## Neighborhoods

- `GET /v1/neighborhoods/search?query=` - search neighborhoods (zip/city/name)
- `GET /v1/neighborhoods/:id` - neighborhood details

## Interests

- `GET /v1/interests` - list available interests
- `PUT /v1/profile/interests` - replace my interests

## Availability

- `GET /v1/availability/windows` - list time windows
- `PUT /v1/profile/availability` - replace my availability

## Discovery

- `GET /v1/discovery` - curated matches (same neighborhood + overlap)
  - Query params: `limit`, `role`, `includeConnected`

## Connections

- `POST /v1/connections` - send request (`recipient_id`)
- `GET /v1/connections` - list my connections + pending requests
- `PATCH /v1/connections/:id` - accept/decline/block

## Messaging

- `GET /v1/connections/:id/messages` - list messages
- `POST /v1/connections/:id/messages` - send message

## Uploads

- `POST /v1/uploads/avatar` - get signed URL
- `POST /v1/uploads/avatar/complete` - confirm upload + save URL

## Admin (Optional later)

- `GET /v1/admin/users` - list users
- `PATCH /v1/admin/users/:id` - deactivate

## Response Notes

- Standard errors: `{ "error": { "code": "...", "message": "..." } }`
- Pagination: `?limit=20&cursor=...` (where applicable)
