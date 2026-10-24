<![CDATA[# 🏗️ CivicPulse — Technical Architecture

> **Last Updated:** October 2026
>
> This document describes the system architecture, data flows, design patterns,
> and technical decisions behind the CivicPulse platform.

---

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Technology Decisions](#technology-decisions)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Database Design](#database-design)
- [Authentication Flow](#authentication-flow)
- [Issue Lifecycle Flow](#issue-lifecycle-flow)
- [API Design Patterns](#api-design-patterns)
- [Background Jobs](#background-jobs)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)

---

## System Overview

CivicPulse follows a **monorepo, multi-app** architecture with a shared backend API.

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                    │
│                                                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Citizen Web │  │ Admin Web   │  │ Citizen  │  │ Admin    │   │
│  │ (Next.js)   │  │ (Next.js)   │  │ App (RN) │  │ App (RN) │   │
│  └──────┬──────┘  └──────┬──────┘  └────┬─────┘  └────┬─────┘   │
│         │                │               │              │         │
└─────────┼────────────────┼───────────────┼──────────────┼─────────┘
          │                │               │              │
          ▼                ▼               ▼              ▼
    ┌─────────────────────────────────────────────────────────┐
    │              REST API (Express.js + Node.js)            │
    │                                                         │
    │  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌─────────────┐  │
    │  │  Auth   │ │  Issues  │ │ Upload │ │ Notifications│  │
    │  │ Module  │ │  Module  │ │ Module │ │   Module     │  │
    │  └─────────┘ └──────────┘ └────────┘ └─────────────┘  │
    │  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌─────────────┐  │
    │  │Community│ │Assignment│ │Feedback│ │  Analytics  │  │
    │  │ Module  │ │  Module  │ │ Module │ │   Module    │  │
    │  └─────────┘ └──────────┘ └────────┘ └─────────────┘  │
    │  ┌─────────┐ ┌──────────┐ ┌────────┐
    │  │  Users  │ │  Polls   │ │  Admin │
    │  │ Module  │ │  Module  │ │ Module │
    │  └─────────┘ └──────────┘ └────────┘
    │                                                         │
    │  ┌──────────────────────────────────────────────────┐  │
    │  │           Middleware Layer                        │  │
    │  │  Auth │ RBAC │ Rate Limit │ Validation │ Upload  │  │
    │  └──────────────────────────────────────────────────┘  │
    │                                                         │
    │  ┌──────────────────────────────────────────────────┐  │
    │  │           Background Jobs (SLA, Cleanup, Notif)  │  │
    │  └──────────────────────────────────────────────────┘  │
    └────────────────────────┬────────────────────────────────┘
                             │
                             ▼
    ┌─────────────────────────────────────────────────────────┐
    │                                                         │
    │  ┌─────────────────┐        ┌────────────────────────┐ │
    │  │   PostgreSQL    │        │   File Storage         │ │
    │  │   (Prisma ORM)  │        │   (Local / S3)         │ │
    │  │                 │        │                        │ │
    │  │  15 Models      │        │  Issue Evidence        │ │
    │  │  6 Enums        │        │  User Uploads          │ │
    │  └─────────────────┘        └────────────────────────┘ │
    │                    DATA LAYER                            │
    └─────────────────────────────────────────────────────────┘
```

---

## Technology Decisions

| Decision                  | Choice               | Rationale                                                   |
|---------------------------|----------------------|-------------------------------------------------------------|
| **Monorepo structure**    | Flat directories     | Simple to manage, no monorepo tooling overhead (Turborepo planned) |
| **API framework**         | Express 5            | Mature, well-known, large ecosystem                         |
| **ORM**                   | Prisma 6.x           | Type-safe queries, auto-generated client, migration system  |
| **Database**              | PostgreSQL 16        | ACID-compliant, supports JSON, excellent indexing           |
| **Auth strategy**         | JWT + Refresh tokens | Stateless API auth with secure token rotation               |
| **Validation**            | Zod 4.x              | Runtime type checking, composable schemas                   |
| **Frontend framework**    | Next.js 16 (App Router) | SSR/SSG, file-based routing, React Server Components     |
| **Mobile framework**      | React Native (planned) | Code sharing with web, cross-platform                    |

---

## Backend Architecture

### Module Pattern (Feature-Based)

Each backend feature is organized as a self-contained module:

```
modules/<feature>/
├── <feature>.controller.js    ← HTTP request/response handling
├── <feature>.service.js       ← Business logic & orchestration
├── <feature>.repository.js    ← Database access (Prisma queries)
├── <feature>.routes.js        ← Express route definitions
└── <feature>.validation.js    ← Zod input validation schemas
```

### Request → Response Flow

```
Client Request
    │
    ▼
┌──────────────────────┐
│  Express Router      │  Route matching
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Middleware Chain     │
│  ┌─────────────────┐ │
│  │ Rate Limiter    │ │  Throttle excessive requests
│  ├─────────────────┤ │
│  │ Auth Middleware  │ │  Verify JWT, attach user to req
│  ├─────────────────┤ │
│  │ Role Middleware  │ │  Check RBAC permissions
│  ├─────────────────┤ │
│  │ Validation MW   │ │  Validate body/params with Zod
│  └─────────────────┘ │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Controller          │  Parse request, call service, send response
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Service             │  Business logic, orchestration, error handling
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Repository          │  Prisma ORM queries to PostgreSQL
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Database            │  PostgreSQL with Prisma-managed schema
└──────────────────────┘
```

### Error Handling Strategy

```
throw new Error("message")    →    error.middleware.js catches
                                        │
                                        ▼
                              Standardized JSON response:
                              {
                                "success": false,
                                "error": "message",
                                "statusCode": 4xx/5xx
                              }
```

---

## Frontend Architecture

### Next.js App Router Structure

```
src/
├── app/                    ← Pages (file-based routing)
│   ├── layout.tsx          ← Root layout (providers, navigation)
│   ├── page.tsx            ← Landing page (/)
│   ├── login/page.tsx      ← /login
│   ├── dashboard/page.tsx  ← /dashboard
│   └── ...
│
├── components/             ← Reusable UI components
│   ├── layout/             ← Shell, Navbar, Footer
│   ├── ui/                 ← Buttons, Cards, Modals (planned)
│   └── <feature>/          ← Feature-specific components (planned)
│
├── hooks/                  ← Custom React hooks
│   └── useAuth.tsx         ← Auth state management
│
├── lib/                    ← Utilities & API client
│   ├── api-client.ts       ← HTTP client wrapper
│   ├── constants.ts        ← App-wide constants
│   └── utils.ts            ← Helper functions
│
└── types/                  ← TypeScript type definitions
    └── index.ts            ← Shared interfaces & types
```

### Client-Server Data Flow

```
React Component
    │
    ├── useAuth() hook      →   Check local storage for JWT
    │
    ├── API call via        →   lib/api-client.ts
    │   api-client.ts             │
    │                             ├── Attach Authorization header
    │                             ├── Handle 401 → refresh token
    │                             └── Parse response
    │
    └── Update state        →   Re-render component
```

---

## Database Design

### Entity Relationship Overview

```
┌──────────┐     ┌───────────────┐     ┌──────────────┐
│   User   │────▶│    Issue      │────▶│ IssueEvidence│
│          │     │               │     └──────────────┘
│  CITIZEN │     │  title        │
│  STAFF   │     │  description  │     ┌──────────────────┐
│  ADMIN   │     │  status       │────▶│IssueStatusHistory│
│          │     │  priority     │     └──────────────────┘
└────┬─────┘     │  location     │
     │           └───────┬───────┘     ┌──────────────┐
     │                   │        ────▶│  IssueSLA    │
     │                   │             └──────────────┘
     │                   │
     │           ┌───────┴───────┐     ┌──────────────┐
     │           │IssueAssignment│────▶│  Department  │
     │           └───────────────┘     └──────────────┘
     │
     ├──────────▶┌───────────────┐
     │           │ CommunityPost │────▶ CommunityPostComment
     │           └───────────────┘
     │
     ├──────────▶┌───────────────┐
     │           │  Notification │
     │           └───────────────┘
     │
     ├──────────▶┌───────────────┐
     │           │ IssueFeedback │
     │           └───────────────┘
     │
     └──────────▶┌───────────────┐     ┌────────────────┐
                 │   Election    │────▶│ ElectionOption │
                 └───────────────┘     └───────┬────────┘
                                               │
                                       ┌───────┴────────┐
                                       │     Vote       │
                                       │  (anonymous)   │
                                       └────────────────┘
```

### Key Design Decisions

1. **UUID Primary Keys** — All models use UUIDs for security (no sequential IDs)
2. **Soft-delete ready** — `isActive` flags on User and Department
3. **Normalized categories** — `IssueCategory` is a table, not an enum (extensible)
4. **Audit trail** — `IssueStatusHistory` tracks every status change with user + timestamp
5. **Anonymous voting** — `Vote.voterReferenceHash` decouples voter identity from ballot
6. **SLA tracking** — `IssueSLA` has `dueAt` and `isBreached` for automated monitoring

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRATION                              │
│                                                              │
│  Client                   Server                            │
│    │                        │                                │
│    ├─ POST /auth/register ─▶│  Validate with Zod            │
│    │  {name,email,password} │  Hash password (bcrypt)        │
│    │                        │  Create User in DB             │
│    │◀── 201 Created ───────│  Return user data              │
│    │                        │                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    LOGIN + TOKEN ROTATION                     │
│                                                              │
│  Client                   Server                            │
│    │                        │                                │
│    ├─ POST /auth/login ────▶│  Verify email + password       │
│    │  {email, password}     │  Generate access token (JWT)   │
│    │                        │  Generate refresh token        │
│    │◀── {accessToken,      │  Store refresh in DB           │
│    │     refreshToken} ────│                                │
│    │                        │                                │
│    │  [Token expires]       │                                │
│    │                        │                                │
│    ├─ POST /auth/refresh ──▶│  Verify refresh token          │
│    │  {refreshToken}        │  Revoke old refresh token      │
│    │                        │  Issue new token pair          │
│    │◀── {newAccessToken,   │                                │
│    │     newRefreshToken} ──│                                │
│    │                        │                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATED REQUESTS                     │
│                                                              │
│  Client                   Server                            │
│    │                        │                                │
│    ├─ GET /api/issues ─────▶│  auth.middleware.js:            │
│    │  Authorization:        │    1. Extract Bearer token      │
│    │  Bearer <jwt>          │    2. Verify JWT signature      │
│    │                        │    3. Decode user ID + role     │
│    │                        │    4. Attach to req.user        │
│    │                        │                                │
│    │                        │  role.middleware.js:             │
│    │                        │    1. Check req.user.role       │
│    │                        │    2. Match against required    │
│    │                        │       permissions               │
│    │                        │                                │
│    │◀── 200 OK ────────────│  Proceed to controller          │
│    │    {issues: [...]}     │                                │
│    │                        │                                │
└─────────────────────────────────────────────────────────────┘
```

### Role-Based Access Control (RBAC)

| Role              | Capabilities                                              |
|-------------------|-----------------------------------------------------------|
| `CITIZEN`         | Report issues, view own issues, community posts, feedback |
| `DEPARTMENT_STAFF`| View assigned issues, update status, add comments         |
| `DEPARTMENT_ADMIN`| All staff + assign issues, manage department              |
| `SUPER_ADMIN`     | Full platform access, manage departments, users, settings |

---

## Issue Lifecycle Flow

```
                    ┌─────────────┐
                    │  SUBMITTED  │ ← Citizen reports issue
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ UNDER_REVIEW│ ← Admin/system reviews
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │                         │
       ┌──────▼──────┐          ┌──────▼──────┐
       │ IN_PROGRESS │          │  REJECTED   │ ← Invalid/duplicate
       └──────┬──────┘          └─────────────┘
              │
              │  (Assignment to department)
              │  (SLA timer starts)
              │
       ┌──────▼──────┐
       │  RESOLVED   │ ← Staff marks resolved
       └──────┬──────┘
              │
              │  Citizen provides feedback (1-5 rating)
              │  Notification sent to all stakeholders
              ▼
         [COMPLETE]
```

### SLA Enforcement

```
Issue Created → SLA Timer Starts
    │
    ├── sla.job.js runs on interval (configurable)
    │   │
    │   ├── Check: current_time > issue.slaDueAt?
    │   │   ├── YES → Mark SLA as BREACHED
    │   │   │         Send SLA_BREACHED notification
    │   │   │
    │   │   └── NO  → Check: approaching deadline?
    │   │             ├── YES → Send SLA_WARNING notification
    │   │             └── NO  → Skip
    │   │
    └── Loop continues until issue resolved or SLA breached
```

---

## API Design Patterns

### Standardized Response Format

```json
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Issues retrieved successfully",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}

// Error Response
{
  "success": false,
  "error": "Issue not found",
  "statusCode": 404
}
```

### Pagination Pattern

All list endpoints support:
- `?page=1` — Page number (1-indexed)
- `?limit=10` — Items per page
- `?sortBy=createdAt` — Sort field
- `?sortOrder=desc` — Sort direction

### Filtering Pattern

Issue-specific filters:
- `?status=IN_PROGRESS` — Filter by status
- `?priority=HIGH` — Filter by priority
- `?categoryId=<uuid>` — Filter by category
- `?city=Mumbai` — Filter by location
- `?search=pothole` — Full-text search

---

## Background Jobs

```
┌─────────────────────────────────────────────────┐
│            Background Job Scheduler              │
│            (src/jobs/index.js)                    │
│                                                  │
│  ┌────────────────┐  Interval: 1 hour            │
│  │  SLA Job       │  Check for SLA breaches      │
│  │  sla.job.js    │  Send warning notifications   │
│  └────────────────┘                               │
│                                                  │
│  ┌────────────────┐  Interval: 1 hour            │
│  │ Notification   │  Process pending              │
│  │ Job            │  notifications                │
│  │ notification.  │  Send digest emails           │
│  │ job.js         │  (future)                     │
│  └────────────────┘                               │
│                                                  │
│  ┌────────────────┐  Interval: 24 hours           │
│  │ Cleanup Job    │  Purge old notifications      │
│  │ cleanup.job.js │  (90-day retention)           │
│  └────────────────┘                               │
│                                                  │
│  Toggle: ENABLE_BACKGROUND_JOBS=true/false        │
└─────────────────────────────────────────────────┘
```

---



## Security Architecture

### Defense Layers

| Layer                   | Implementation                                    |
|-------------------------|---------------------------------------------------|
| **Transport**           | HTTPS (in production)                             |
| **Authentication**      | JWT with refresh token rotation                   |
| **Authorization**       | RBAC middleware with granular permissions          |
| **Input Validation**    | Zod schemas on all API inputs                     |
| **Rate Limiting**       | Per-endpoint rate limits                          |
| **Password Security**   | bcrypt hashing with salt rounds                   |
| **SQL Injection**       | Prisma ORM parameterized queries                  |
| **XSS Protection**      | React auto-escaping, CSP headers (planned)        |
| **CORS**                | Configurable origin whitelist                     |
| **File Upload Security**| Size limits, type checking                        |
| **Secrets Management**  | Environment variables, `.env` files               |

### Sensitive Data Handling

- **No raw Aadhaar/SSN storage** — Only hashed identity proofs
- **Anonymous voting** — Voter reference hash, no direct user FK on ballots
- **Cascading deletes** — User deletion cleans up all related data
- **Token revocation** — Refresh tokens can be revoked individually

---

## Deployment Architecture (Planned)

```
┌─────────────────────────────────────────────────┐
│                  Production                      │
│                                                  │
│  ┌──────────┐     ┌──────────┐                  │
│  │ Nginx /  │────▶│ Next.js  │  Citizen Web     │
│  │ CDN      │     │ Server   │  (SSR + Static)  │
│  │          │     └──────────┘                  │
│  │          │                                    │
│  │          │     ┌──────────┐                  │
│  │          │────▶│ Express  │  REST API         │
│  │          │     │ Server   │  (Port 5000)     │
│  └──────────┘     └────┬─────┘                  │
│                        │                         │
│              ┌─────────┼─────────┐              │
│              │         │         │              │
│         ┌────▼───┐ ┌───▼───┐ ┌──▼──────┐       │
│         │Postgres│ │ Redis │ │ S3/Minio│       │
│         │  (DB)  │ │(Cache)│ │(Storage)│       │
│         └────────┘ └───────┘ └─────────┘       │
│                                                  │
│  Docker Compose / Kubernetes                     │
└─────────────────────────────────────────────────┘
```

> **Note:** Redis and S3/Minio are planned additions. Currently, the platform uses local file storage and no caching layer.
]]>
