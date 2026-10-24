<![CDATA[# 📋 CivicPulse — Task Tracker

> **Last Updated:** October 2026
>
> This document tracks what work needs to be done in each file and module.
> Use this as your single source of truth for picking up tasks.

---

## How to Use This File

1. **Find your area** — Browse by module/app below
2. **Pick a task** — Look for 🔴 (not started) or 🟡 (in progress) items
3. **Create a branch** — `git checkout -b feature/<task-name>`
4. **Update this file** — Mark tasks as ✅ when complete

### Status Legend

| Icon | Meaning |
|------|---------|
| ✅   | Complete |
| 🟡   | In Progress |
| 🔴   | Not Started |
| ⚠️   | Blocked / Needs Discussion |

---

## 1. Backend API (`backend/`)

### 1.1 Core Infrastructure

| File | Task | Status | Assignee | Notes |
|------|------|--------|----------|-------|
| `src/app.js` | Express app setup with middleware | ✅ | — | CORS, body parsing, routes mounted |
| `src/server.js` | HTTP server with graceful shutdown | ✅ | — | Port from env, error handling |
| `docker-compose.yml` | PostgreSQL container config | ✅ | — | Basic PostgreSQL setup |
| `docker-compose.yml` | Add Redis container | 🔴 | — | For caching & session store |
| `docker-compose.yml` | Add MinIO container for S3-compatible storage | 🔴 | — | Replace local file storage |
| `package.json` | Add `helmet` for security headers | 🔴 | — | CSP, HSTS, XSS protection |
| `package.json` | Add `morgan` or `pino` for request logging | 🔴 | — | Structured logging |
| `package.json` | Add `compression` middleware | 🔴 | — | Gzip responses |

### 1.2 Configuration (`src/config/`)

| File | Task | Status | Notes |
|------|------|--------|-------|
| `environment.js` | Env variable loading & validation | ✅ | All vars validated |
| `database.js` | Prisma client singleton | ✅ | Connection pooling |
| `permissions.js` | RBAC permission matrix | ✅ | All 4 roles defined |
| `storage.js` | File storage config | ✅ | Local disk |
| `storage.js` | Add S3/Cloudinary provider support | 🔴 | Abstract storage interface |

### 1.3 Middleware (`src/middleware/`)

| File | Task | Status | Notes |
|------|------|--------|-------|
| `auth.middleware.js` | JWT verification | ✅ | Access + refresh token |
| `role.middleware.js` | RBAC enforcement | ✅ | Role-based route guards |
| `error.middleware.js` | Global error handler | ✅ | Standardized error response |
| `rateLimit.middleware.js` | Rate limiting | ✅ | Per-endpoint limits |
| `upload.middleware.js` | File upload handling | ✅ | Multer-based |
| `validation.middleware.js` | Zod validation | ✅ | Generic validator |
| — | Add request ID middleware | 🔴 | Trace requests across logs |
| — | Add CORS preflight caching | 🔴 | Optimize OPTIONS requests |

### 1.4 Modules (`src/modules/`)

#### Auth Module

| File | Task | Status | Notes |
|------|------|--------|-------|
| `auth.controller.js` | Register, login, refresh, logout handlers | ✅ | |
| `auth.service.js` | Auth business logic | ✅ | Password hashing, JWT |
| `auth.repository.js` | User & token DB queries | ✅ | |
| `auth.routes.js` | Route definitions | ✅ | |
| `auth.validation.js` | Zod schemas | ✅ | |
| — | Add email verification flow | 🔴 | OTP or magic link |
| — | Add password reset flow | 🔴 | Forgot password + reset |
| — | Add OAuth2 (Google/GitHub) login | 🔴 | Social login |

#### Issues Module

| File | Task | Status | Notes |
|------|------|--------|-------|
| `issue.controller.js` | CRUD + status update handlers | ✅ | |
| `issue.service.js` | Issue business logic | ✅ | |
| `issue.repository.js` | Filtered queries, pagination | ✅ | |
| `issue.routes.js` | Route definitions | ✅ | |
| `issue.validation.js` | Zod schemas | ✅ | |
| — | Add geospatial search (nearby issues) | 🔴 | PostGIS or basic radius |
| — | Add duplicate issue detection | 🔴 | Similarity matching |
| — | Add issue export (CSV/PDF) | 🔴 | Report generation |

#### Community Module

| File | Task | Status | Notes |
|------|------|--------|-------|
| `community.controller.js` | Post & comment CRUD | ✅ | |
| `community.service.js` | Community business logic | ✅ | |
| `community.repository.js` | Community DB queries | ✅ | |
| `community.routes.js` | Route definitions | ✅ | |
| — | Add post upvotes/likes | 🔴 | New model needed |
| — | Add post moderation (flag/hide) | 🔴 | Admin content moderation |
| — | Add image uploads for posts | 🔴 | Integrate with upload module |

#### Assignments Module

| File | Task | Status | Notes |
|------|------|--------|-------|
| `assignment.controller.js` | Assignment CRUD | ✅ | |
| `assignment.service.js` | Assignment logic | ✅ | |
| `assignment.repository.js` | Assignment queries | ✅ | |
| `assignment.routes.js` | Routes | ✅ | |
| — | Add auto-assignment algorithm | 🔴 | Category → department mapping |
| — | Add workload balancing | 🔴 | Distribute evenly among staff |

#### Departments Module

| File | Task | Status | Notes |
|------|------|--------|-------|
| `department.controller.js` | Department CRUD | ✅ | |
| `department.service.js` | Department logic | ✅ | |
| `department.repository.js` | Department queries | ✅ | |
| `department.routes.js` | Routes | ✅ | |
| — | Add department-category mapping | 🔴 | Which dept handles what |
| — | Add department performance metrics | 🔴 | Resolution rate, avg time |

#### Notifications Module

| File | Task | Status | Notes |
|------|------|--------|-------|
| `notification.controller.js` | Get & mark-read handlers | ✅ | |
| `notification.service.js` | Create notification logic | ✅ | |
| `notification.routes.js` | Routes | ✅ | |
| — | Add WebSocket real-time notifications | 🔴 | Socket.io integration |
| — | Add email notification channel | 🔴 | Nodemailer / SendGrid |
| — | Add push notification (FCM) | 🔴 | For mobile apps |

#### Feedback Module

| File | Task | Status | Notes |
|------|------|--------|-------|
| `feedback.controller.js` | Feedback CRUD | ✅ | |
| `feedback.service.js` | Feedback logic | ✅ | |
| `feedback.repository.js` | Feedback queries | ✅ | |
| `feedback.routes.js` | Routes | ✅ | |
| — | Add aggregate ratings per department | 🔴 | Avg rating, total reviews |

#### Uploads Module

| File | Task | Status | Notes |
|------|------|--------|-------|
| `upload.controller.js` | Upload handlers | ✅ | |
| `upload.service.js` | Upload logic | ✅ | |
| `upload.routes.js` | Routes | ✅ | |
| — | Add image compression/thumbnails | 🔴 | Sharp.js |
| — | Add virus scanning | 🔴 | ClamAV integration |

#### Analytics Module

| File | Task | Status | Notes |
|------|------|--------|-------|
| `analytics.controller.js` | Analytics handlers | ✅ | |
| `analytics.service.js` | Analytics queries | ✅ | |
| `analytics.routes.js` | Routes | ✅ | |
| — | Add time-series data (trends) | 🔴 | Issues per day/week/month |
| — | Add department comparison analytics | 🔴 | Cross-department metrics |
| — | Add geographic heatmap data | 🔴 | Issue density by area |

#### Users / Citizens / Admin Modules

| File | Task | Status | Notes |
|------|------|--------|-------|
| `user.controller/service/repository/routes.js` | User profile CRUD | ✅ | |
| `citizen.controller/service/repository/routes.js` | Citizen operations | ✅ | |
| `admin.controller/service/routes.js` | Admin operations | ✅ | |
| — | Add user avatar upload | 🔴 | Profile picture |
| — | Add user activity log | 🔴 | Track actions |

#### Polls Module

| File | Task | Status | Notes |
|------|------|--------|-------|
| `poll.controller.js` | Election/poll CRUD | ✅ | |
| `poll.service.js` | Voting logic | ✅ | Anonymous voting |
| `poll.repository.js` | Poll queries | ✅ | |
| `poll.routes.js` | Routes | ✅ | |
| — | Add vote verification | 🔴 | Cryptographic hash check |
| — | Add election results caching | 🔴 | Performance |

### 1.5 Background Jobs (`src/jobs/`)

| File | Task | Status | Notes |
|------|------|--------|-------|
| `index.js` | Job scheduler orchestrator | ✅ | Interval-based |
| `sla.job.js` | SLA breach detection | ✅ | Check + notify |
| `notification.job.js` | Notification processing | ✅ | Digest logic |
| `cleanup.job.js` | Old data cleanup | ✅ | 90-day retention |
| — | Migrate to proper job queue (Bull/BullMQ) | 🔴 | Redis-backed queues |

### 1.6 Tests (`tests/`)

| File | Task | Status | Notes |
|------|------|--------|-------|
| `health.test.js` | Health endpoint tests | ✅ | |
| `auth-security.test.js` | Auth security tests | ✅ | |
| `integration.test.js` | Full integration tests | ✅ | |
| `server-startup.test.js` | Server boot tests | ✅ | |
| — | Add unit tests for each service | 🔴 | Mock repositories |
| — | Add E2E tests with test database | 🔴 | Full flow testing |
| — | Add load/performance tests | 🔴 | k6 or Artillery |

### 1.7 Database (`prisma/`)

| File | Task | Status | Notes |
|------|------|--------|-------|
| `schema.prisma` | Full schema (15 models, 6 enums) | ✅ | Comprehensive |
| `seed.js` | Sample data seeder | ✅ | All models |
| `migrations/` | Migration history | ✅ | |
| — | Add database indexes review | 🔴 | Performance audit |
| — | Add soft-delete migration | 🔴 | `deletedAt` columns |

---

## 2. Citizen Web App (`apps/citizen-web/`)

### 2.1 Pages

| File | Task | Status | Priority | Notes |
|------|------|--------|----------|-------|
| `app/layout.tsx` | Root layout with Navbar | ✅ | — | |
| `app/page.tsx` | Landing page | ✅ | — | Hero + features |
| `app/globals.css` | Design system | ✅ | — | Full CSS system |
| `app/login/page.tsx` | Login form + API integration | 🟡 | **HIGH** | UI exists, needs API |
| `app/register/page.tsx` | Registration form | 🟡 | **HIGH** | UI exists, needs API |
| `app/dashboard/page.tsx` | Citizen dashboard | 🟡 | **HIGH** | Stats, recent issues |
| `app/report/page.tsx` | Report issue form | 🟡 | **HIGH** | Form + geolocation + upload |
| `app/issues/page.tsx` | Issues listing | 🟡 | **HIGH** | Filters, pagination |
| `app/issues/[id]/page.tsx` | Issue detail view | 🟡 | **HIGH** | Status, timeline, comments |
| `app/community/page.tsx` | Community forum | 🟡 | MEDIUM | Post list + create |
| `app/community/[id]/page.tsx` | Single post view | 🟡 | MEDIUM | Comments |
| `app/notifications/page.tsx` | Notification center | 🟡 | MEDIUM | List + mark read |
| `app/feedback/[issueId]/page.tsx` | Feedback form | 🟡 | MEDIUM | Rating + comment |
| `app/profile/page.tsx` | User profile | 🟡 | LOW | View + edit |
| `app/transparency/page.tsx` | Transparency dashboard | 🟡 | LOW | Charts, metrics |

### 2.2 Components

| File | Task | Status | Priority | Notes |
|------|------|--------|----------|-------|
| `components/layout/Navbar.tsx` | Navigation bar | ✅ | — | |
| `components/layout/AppShell.tsx` | App wrapper | ✅ | — | |
| — | `components/layout/Footer.tsx` | 🔴 | MEDIUM | Footer component |
| — | `components/layout/Sidebar.tsx` | 🔴 | LOW | Mobile sidebar nav |
| — | `components/ui/Button.tsx` | 🔴 | **HIGH** | Reusable button |
| — | `components/ui/Input.tsx` | 🔴 | **HIGH** | Form input |
| — | `components/ui/Card.tsx` | 🔴 | **HIGH** | Content card |
| — | `components/ui/Modal.tsx` | 🔴 | **HIGH** | Dialog/modal |
| — | `components/ui/Badge.tsx` | 🔴 | MEDIUM | Status badges |
| — | `components/ui/Spinner.tsx` | 🔴 | MEDIUM | Loading spinner |
| — | `components/ui/Toast.tsx` | 🔴 | MEDIUM | Notifications |
| — | `components/ui/Pagination.tsx` | 🔴 | MEDIUM | Page navigation |
| — | `components/issues/IssueCard.tsx` | 🔴 | **HIGH** | Issue list item |
| — | `components/issues/IssueTimeline.tsx` | 🔴 | **HIGH** | Status history |
| — | `components/issues/IssueFilters.tsx` | 🔴 | MEDIUM | Filter panel |
| — | `components/issues/IssueMap.tsx` | 🔴 | LOW | Map view |
| — | `components/auth/LoginForm.tsx` | 🔴 | **HIGH** | Login form component |
| — | `components/auth/RegisterForm.tsx` | 🔴 | **HIGH** | Register form |
| — | `components/dashboard/StatsCard.tsx` | 🔴 | **HIGH** | Dashboard stat card |
| — | `components/dashboard/RecentIssues.tsx` | 🔴 | **HIGH** | Recent issues list |
| — | `components/location/LocationPicker.tsx` | 🔴 | MEDIUM | Geolocation selector |
| — | `components/evidence/EvidenceUpload.tsx` | 🔴 | MEDIUM | File upload UI |
| — | `components/community/PostCard.tsx` | 🔴 | MEDIUM | Community post card |
| — | `components/feedback/FeedbackForm.tsx` | 🔴 | MEDIUM | Rating + comment form |
| — | `components/transparency/Charts.tsx` | 🔴 | LOW | Analytics charts |

### 2.3 Hooks

| File | Task | Status | Notes |
|------|------|--------|-------|
| `hooks/useAuth.tsx` | Auth state management | ✅ | Login, logout, session |
| — | `hooks/useIssues.ts` | 🔴 | Fetch, create, filter issues |
| — | `hooks/useIssue.ts` | 🔴 | Single issue details |
| — | `hooks/useLocation.ts` | 🔴 | Geolocation hook |
| — | `hooks/useUpload.ts` | 🔴 | File upload hook |
| — | `hooks/useNotifications.ts` | 🔴 | Notifications hook |
| — | `hooks/useCommunity.ts` | 🔴 | Community posts hook |
| — | `hooks/usePagination.ts` | 🔴 | Generic pagination |

### 2.4 Services & Lib

| File | Task | Status | Notes |
|------|------|--------|-------|
| `lib/api-client.ts` | HTTP client with auth interceptors | ✅ | |
| `lib/constants.ts` | App constants | ✅ | |
| `lib/utils.ts` | Utility functions | ✅ | |
| — | `lib/validators.ts` | 🔴 | Client-side form validation |
| — | `lib/storage.ts` | 🔴 | LocalStorage helpers |
| `types/index.ts` | TypeScript interfaces | ✅ | |

---

## 3. Admin Web App (`apps/admin-web/`)

| Area | Task | Status | Priority | Notes |
|------|------|--------|----------|-------|
| Setup | Initialize Next.js project with package.json | 🔴 | **HIGH** | No framework init yet |
| Setup | Create shared design system / CSS | 🔴 | **HIGH** | Consistent with citizen-web |
| `app/login/` | Admin login page | 🔴 | **HIGH** | |
| `app/dashboard/` | Admin dashboard with metrics | 🔴 | **HIGH** | Issue counts, SLA stats |
| `app/issues/` | Issue management table | 🔴 | **HIGH** | CRUD, filters, bulk actions |
| `app/assignments/` | Assignment management | 🔴 | **HIGH** | Assign issues to staff |
| `app/departments/` | Department CRUD | 🔴 | MEDIUM | |
| `app/users/` | User management | 🔴 | MEDIUM | View, edit, deactivate |
| `app/analytics/` | Analytics dashboard | 🔴 | MEDIUM | Charts, reports |
| `app/sla/` | SLA monitoring | 🔴 | MEDIUM | Breaches, warnings |
| `app/notifications/` | Admin notifications | 🔴 | LOW | |
| `app/settings/` | System settings | 🔴 | LOW | |
| `app/complaints/` | Escalated complaints | 🔴 | LOW | |
| `components/` | Shared admin components | 🔴 | **HIGH** | Tables, forms, charts |
| `services/` | API service layer | 🔴 | **HIGH** | API integration |

---

## 4. Mobile Apps (`apps/citizen-app/` & `apps/admin-app/`)

| Area | Task | Status | Priority | Notes |
|------|------|--------|----------|-------|
| `citizen-app/` | Initialize React Native project | 🔴 | LOW | Expo or bare RN |
| `citizen-app/` | Setup navigation (React Navigation) | 🔴 | LOW | Stack + Tab navigators |
| `citizen-app/` | Build auth screens | 🔴 | LOW | Login, register |
| `citizen-app/` | Build home/dashboard screen | 🔴 | LOW | |
| `citizen-app/` | Build report issue flow | 🔴 | LOW | Camera + location |
| `citizen-app/` | Build issues list | 🔴 | LOW | |
| `citizen-app/` | Build community screen | 🔴 | LOW | |
| `admin-app/` | Initialize React Native project | 🔴 | LOW | |
| `admin-app/` | Build admin screens | 🔴 | LOW | Mirror admin-web |

---



---

## 6. Documentation (`docs/`)

| File | Task | Status | Notes |
|------|------|--------|-------|
| `PROJECT_STRUCTURE.md` | Annotated directory tree | ✅ | Full layout |
| `TECHNICAL_ARCHITECTURE.md` | System architecture & flows | ✅ | Complete |
| `TASK_TRACKER.md` | This file | ✅ | Work items |
| `REQUIREMENTS.md` | Requirements document | ✅ | Functional + NFR |
| `docs/api/` | API endpoint documentation | 🔴 | Swagger/OpenAPI |
| `docs/architecture/` | Architecture diagrams | 🔴 | Draw.io / Mermaid |
| `docs/database/` | Database design docs | 🔴 | ERD, migration guide |

---

## 7. DevOps & Infrastructure

| Task | Status | Priority | Notes |
|------|--------|----------|-------|
| Add GitHub Actions CI pipeline | 🔴 | **HIGH** | Lint, test, build |
| Add Dockerfile for backend | 🔴 | MEDIUM | Multi-stage build |
| Add Dockerfile for citizen-web | 🔴 | MEDIUM | Next.js Docker |
| Add production docker-compose | 🔴 | MEDIUM | Full stack |
| Setup environment-specific configs | 🔴 | MEDIUM | Dev, staging, prod |
| Add Husky + lint-staged | 🔴 | LOW | Pre-commit hooks |
| Add Prettier config | 🔴 | LOW | Code formatting |
| Add root package.json with workspaces | 🔴 | MEDIUM | npm workspaces |

---

## Summary

| Area | Total Tasks | ✅ Done | 🟡 In Progress | 🔴 Not Started |
|------|-------------|---------|-----------------|-----------------|
| Backend Core | 8 | 5 | 0 | 3 |
| Backend Config | 7 | 5 | 0 | 2 |
| Backend Middleware | 8 | 6 | 0 | 2 |
| Backend Modules | ~60 | ~42 | 0 | ~18 |
| Backend Jobs | 5 | 4 | 0 | 1 |
| Backend Tests | 7 | 4 | 0 | 3 |
| Citizen Web Pages | 14 | 3 | 11 | 0 |
| Citizen Web Components | ~25 | 2 | 0 | ~23 |
| Citizen Web Hooks | 8 | 1 | 0 | 7 |
| Admin Web | 14 | 0 | 0 | 14 |
| Mobile Apps | 9 | 0 | 0 | 9 |
| Documentation | 7 | 4 | 0 | 3 |
| DevOps | 7 | 0 | 0 | 7 |
| **TOTAL** | **~172** | **~73** | **~11** | **~88** |
]]>
