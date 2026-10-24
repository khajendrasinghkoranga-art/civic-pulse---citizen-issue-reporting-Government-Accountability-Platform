<![CDATA[# 📁 CivicPulse — Full Project Structure

> **Last Updated:** October 2026
>
> This document provides a complete annotated directory tree of the CivicPulse monorepo.
> Each file and folder is described with its purpose and current implementation status.

---

## Status Legend

| Icon | Meaning |
|------|---------|
| ✅   | Implemented & working |
| 🟡   | Partially implemented / in progress |
| 🔴   | Scaffolded / empty (needs work) |
| 📄   | Configuration / metadata file |

---

## Root Directory

```
CivicPulse/
│
├── 📄 README.md                    ✅  Project overview, setup guide, contribution rules
├── 📄 .gitignore                   ✅  Git ignore rules for node_modules, env, builds
├── 📄 create-structure.ps1         📄  PowerShell script used to scaffold citizen-web dirs
│
├── apps/                           🟡  Frontend applications (web + mobile)
├── backend/                        ✅  Express.js REST API server
├── docs/                           ✅  Project documentation
│
└── (deprecated files)
    └── civicpulse_backup.dump      📄  DB dump file (should be in .gitignore)
```

---

## `apps/` — Frontend Applications

### `apps/citizen-web/` — Citizen Web Portal (Next.js 16)

```
apps/citizen-web/
├── 📄 package.json                 ✅  Dependencies: Next.js 16, React 19, TypeScript
├── 📄 tsconfig.json                ✅  TypeScript configuration
├── 📄 next.config.ts               ✅  Next.js configuration
├── 📄 eslint.config.mjs            ✅  ESLint flat config
├── 📄 .env.local                   📄  Local environment variables
├── 📄 .gitignore                   ✅  Framework-specific ignores
│
├── public/                         🔴  Static assets (images, icons, logos)
│
└── src/
    ├── app/                        🟡  Next.js App Router pages
    │   ├── layout.tsx              ✅  Root layout with Navbar shell
    │   ├── page.tsx                ✅  Landing / home page
    │   ├── globals.css             ✅  Global styles (37KB — design system)
    │   ├── favicon.ico             ✅  Favicon
    │   │
    │   ├── login/
    │   │   └── page.tsx            🟡  Login page
    │   ├── register/
    │   │   └── page.tsx            🟡  Registration page
    │   ├── dashboard/
    │   │   └── page.tsx            🟡  Citizen dashboard
    │   ├── report/
    │   │   └── page.tsx            🟡  Report new issue
    │   ├── issues/
    │   │   ├── page.tsx            🟡  Issues listing page
    │   │   └── [id]/
    │   │       └── page.tsx        🟡  Single issue detail
    │   ├── community/
    │   │   ├── page.tsx            🟡  Community forum
    │   │   └── [id]/
    │   │       └── page.tsx        🟡  Single community post
    │   ├── notifications/
    │   │   └── page.tsx            🟡  Notifications center
    │   ├── feedback/
    │   │   └── [issueId]/
    │   │       └── page.tsx        🟡  Issue feedback form
    │   ├── profile/
    │   │   └── page.tsx            🟡  User profile
    │   └── transparency/
    │       └── page.tsx            🟡  Transparency dashboard
    │
    ├── components/
    │   └── layout/
    │       ├── AppShell.tsx        ✅  App wrapper shell component
    │       └── Navbar.tsx          ✅  Navigation bar component
    │
    ├── hooks/
    │   └── useAuth.tsx             ✅  Authentication hook (login/logout/session)
    │
    ├── lib/
    │   ├── api-client.ts           ✅  Axios/fetch wrapper for API calls
    │   ├── constants.ts            ✅  App-wide constants
    │   └── utils.ts                ✅  Utility functions
    │
    └── types/
        └── index.ts                ✅  TypeScript type definitions
```

### `apps/admin-web/` — Admin Dashboard (Next.js — planned)

```
apps/admin-web/
├── app/                            🔴  Admin pages (scaffolded, empty)
│   ├── analytics/                  🔴  Analytics dashboard
│   ├── assignments/                🔴  Issue assignment management
│   ├── complaints/                 🔴  Complaints overview
│   ├── dashboard/                  🔴  Admin main dashboard
│   ├── departments/                🔴  Department management
│   ├── issues/                     🔴  Issue management
│   ├── login/                      🔴  Admin login
│   ├── notifications/              🔴  Notification center
│   ├── settings/                   🔴  System settings
│   ├── sla/                        🔴  SLA monitoring
│   └── users/                      🔴  User management
│
├── components/                     🔴  Empty — needs UI components
└── services/                       🔴  Empty — needs API service layer
```

### `apps/citizen-app/` — Citizen Mobile App (React Native — planned)

```
apps/citizen-app/
└── src/
    ├── screens/                    🔴  Scaffolded screen directories
    │   ├── auth/                   🔴  Login/register screens
    │   ├── home/                   🔴  Home screen
    │   ├── report-issue/           🔴  Report issue flow
    │   ├── my-issues/              🔴  User's issues list
    │   ├── community/              🔴  Community forum
    │   ├── polls/                  🔴  Voting / polls
    │   └── profile/                🔴  User profile
    ├── components/                 🔴  Empty — shared components
    ├── services/                   🔴  Empty — API services
    └── navigation/                 🔴  Empty — navigation config
```

### `apps/admin-app/` — Admin Mobile App (React Native — planned)

```
apps/admin-app/
└── src/
    ├── screens/                    🔴  Scaffolded screen directories
    │   ├── auth/                   🔴  Admin login
    │   ├── dashboard/              🔴  Dashboard overview
    │   ├── issues/                 🔴  Issue management
    │   ├── assignments/            🔴  Assignment management
    │   ├── notifications/          🔴  Notifications
    │   └── profile/                🔴  Admin profile
    ├── components/                 🔴  Empty — shared components
    └── services/                   🔴  Empty — API services
```

---

## `backend/` — Express.js REST API

```
backend/
├── 📄 package.json                 ✅  Dependencies & scripts
├── 📄 .env                         📄  Environment variables (not committed)
├── 📄 .env.example                 ✅  Template for environment setup
├── 📄 docker-compose.yml           ✅  PostgreSQL Docker setup
├── 📄 prisma.config.ts             ✅  Prisma configuration
│
├── prisma/
│   ├── schema.prisma               ✅  Database schema (15 models, 6 enums)
│   ├── seed.js                     ✅  Database seeder (sample data)
│   └── migrations/                 ✅  Prisma migration history
│
├── src/
│   ├── app.js                      ✅  Express app setup (middleware, routes)
│   ├── server.js                   ✅  HTTP server entry point
│   │
│   ├── config/                     ✅  Configuration modules
│   │   ├── environment.js          ✅  Env variable loading & validation
│   │   ├── database.js             ✅  Prisma client singleton
│   │   ├── permissions.js          ✅  Role-based permission definitions
│   │   └── storage.js              ✅  File storage configuration
│   │
│   ├── middleware/                  ✅  Express middleware
│   │   ├── auth.middleware.js      ✅  JWT authentication
│   │   ├── role.middleware.js      ✅  Role-based access control
│   │   ├── error.middleware.js     ✅  Global error handler
│   │   ├── rateLimit.middleware.js  ✅  Rate limiting
│   │   ├── upload.middleware.js    ✅  File upload handling
│   │   └── validation.middleware.js ✅ Request validation
│   │
│   ├── modules/                    ✅  Feature modules (MVC pattern)
│   │   ├── auth/                   ✅  Authentication (register, login, refresh, logout)
│   │   │   ├── auth.controller.js  ✅  Request handlers
│   │   │   ├── auth.service.js     ✅  Business logic
│   │   │   ├── auth.repository.js  ✅  Database queries
│   │   │   ├── auth.routes.js      ✅  Route definitions
│   │   │   └── auth.validation.js  ✅  Zod validation schemas
│   │   │
│   │   ├── issues/                 ✅  Issue CRUD & lifecycle
│   │   │   ├── issue.controller.js ✅  Request handlers
│   │   │   ├── issue.service.js    ✅  Business logic
│   │   │   ├── issue.repository.js ✅  Database queries (filters, pagination)
│   │   │   ├── issue.routes.js     ✅  Route definitions
│   │   │   └── issue.validation.js ✅  Zod validation schemas
│   │   │
│   │   ├── community/              ✅  Community posts & comments
│   │   │   ├── community.controller.js  ✅
│   │   │   ├── community.service.js     ✅
│   │   │   ├── community.repository.js  ✅
│   │   │   └── community.routes.js      ✅
│   │   │
│   │   ├── assignments/            ✅  Issue assignment workflow
│   │   │   ├── assignment.controller.js ✅
│   │   │   ├── assignment.service.js    ✅
│   │   │   ├── assignment.repository.js ✅
│   │   │   └── assignment.routes.js     ✅
│   │   │
│   │   ├── departments/            ✅  Department CRUD
│   │   │   ├── department.controller.js ✅
│   │   │   ├── department.service.js    ✅
│   │   │   ├── department.repository.js ✅
│   │   │   └── department.routes.js     ✅
│   │   │
│   │   ├── notifications/          ✅  In-app notifications
│   │   │   ├── notification.controller.js ✅
│   │   │   ├── notification.service.js    ✅
│   │   │   └── notification.routes.js     ✅
│   │   │
│   │   ├── feedback/               ✅  Issue feedback & ratings
│   │   │   ├── feedback.controller.js ✅
│   │   │   ├── feedback.service.js    ✅
│   │   │   ├── feedback.repository.js ✅
│   │   │   └── feedback.routes.js     ✅
│   │   │
│   │   ├── uploads/                ✅  File upload handling
│   │   │   ├── upload.controller.js ✅
│   │   │   ├── upload.service.js    ✅
│   │   │   └── upload.routes.js     ✅
│   │   │
│   │   ├── analytics/              ✅  Dashboard analytics
│   │   │   ├── analytics.controller.js ✅
│   │   │   ├── analytics.service.js    ✅
│   │   │   └── analytics.routes.js     ✅
│   │   │
│   │   ├── users/                  ✅  User profile management
│   │   │   ├── user.controller.js  ✅
│   │   │   ├── user.service.js     ✅
│   │   │   ├── user.repository.js  ✅
│   │   │   └── user.routes.js      ✅
│   │   │
│   │   ├── citizens/               ✅  Citizen-specific operations
│   │   │   ├── citizen.controller.js ✅
│   │   │   ├── citizen.service.js    ✅
│   │   │   ├── citizen.repository.js ✅
│   │   │   └── citizen.routes.js     ✅
│   │   │
│   │   ├── admin/                  ✅  Admin operations
│   │   │   ├── admin.controller.js ✅
│   │   │   ├── admin.service.js    ✅
│   │   │   └── admin.routes.js     ✅
│   │   │
│   │   └── polls/                  ✅  E-voting / polls
│   │   │   ├── poll.controller.js  ✅
│   │   │   ├── poll.service.js     ✅
│   │   │   ├── poll.repository.js  ✅
│   │   │   └── poll.routes.js      ✅

│   │
│   ├── routes/
│   │   └── index.js                ✅  Central route aggregator
│   │
│   ├── utils/                      ✅  Shared utilities
│   │   ├── hash.js                 ✅  Hashing helpers
│   │   ├── pagination.js           ✅  Pagination utility
│   │   ├── response.js             ✅  Standardized API responses
│   │   └── trackingId.js           ✅  Tracking ID generator
│   │
│   └── jobs/                       ✅  Background job scheduler
│       ├── index.js                ✅  Job runner orchestrator
│       ├── sla.job.js              ✅  SLA breach checker
│       ├── notification.job.js     ✅  Notification digests
│       └── cleanup.job.js          ✅  Old data cleanup
│
└── tests/                          ✅  Test suite
    ├── health.test.js              ✅  Health check endpoint tests
    ├── auth-security.test.js       ✅  Auth security tests
    ├── integration.test.js         ✅  Full integration tests
    ├── server-startup.test.js      ✅  Server boot tests
    └── helpers/                    ✅  Test utilities & fixtures
```

---



## `docs/` — Documentation

```
docs/
├── PROJECT_STRUCTURE.md            ✅  This file — full annotated directory tree
├── TECHNICAL_ARCHITECTURE.md       ✅  System architecture, data flow, diagrams
├── TASK_TRACKER.md                 ✅  Per-file work items & TODOs
├── REQUIREMENTS.md                 ✅  Functional & non-functional requirements
│
├── api/                            🔴  API endpoint documentation (to be written)
├── architecture/                   🔴  Architecture diagrams (to be created)
└── database/                       🔴  Database design docs (to be written)
```

---

## Database Schema Summary

The Prisma schema (`backend/prisma/schema.prisma`) defines **15 models** and **6 enums**:

| Model                | Purpose                                          |
|----------------------|--------------------------------------------------|
| `User`               | All platform users (citizens, staff, admins)     |
| `RefreshToken`       | Secure token rotation for JWT auth               |
| `IssueCategory`      | Normalized issue categories                      |
| `Issue`              | Core civic issue reports                         |
| `IssueEvidence`      | Photos/files attached to issues                  |
| `IssueStatusHistory` | Audit trail of status changes                    |
| `Department`         | Government departments                           |
| `IssueAssignment`    | Issue → Department/Staff assignments             |
| `Comment`            | Threaded comments on issues                      |
| `Notification`       | In-app notifications                             |
| `IssueSLA`           | SLA tracking per issue                           |
| `IssueFeedback`      | Citizen ratings on resolved issues               |
| `CommunityPost`      | Community forum posts                            |
| `CommunityPostComment` | Comments on community posts                   |
| `Election` / `ElectionOption` / `Vote` / `VoteResult` | E-voting system |
]]>
