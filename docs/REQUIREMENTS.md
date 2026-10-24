<![CDATA[# 📝 CivicPulse — Requirements Document

> **Last Updated:** October 2026
> **Version:** 1.0
>
> This document defines the functional and non-functional requirements
> for the CivicPulse platform. All contributors should review this
> before starting any feature development.

---

## Table of Contents

- [Product Vision](#product-vision)
- [Stakeholders & Roles](#stakeholders--roles)
- [Functional Requirements](#functional-requirements)
  - [FR-01: User Authentication](#fr-01-user-authentication)
  - [FR-02: Issue Reporting](#fr-02-issue-reporting)
  - [FR-03: Issue Tracking & Lifecycle](#fr-03-issue-tracking--lifecycle)
  - [FR-04: Department Management](#fr-04-department-management)
  - [FR-05: Issue Assignment](#fr-05-issue-assignment)
  - [FR-06: SLA Management](#fr-06-sla-management)
  - [FR-07: Notifications](#fr-07-notifications)
  - [FR-08: Community Forum](#fr-08-community-forum)
  - [FR-09: Citizen Feedback](#fr-09-citizen-feedback)
  - [FR-10: Analytics & Transparency](#fr-10-analytics--transparency)
  - [FR-11: E-Voting / Polls](#fr-11-e-voting--polls)
  - [FR-12: System Audit Trail](#fr-12-system-audit-trail)
  - [FR-13: Admin Panel](#fr-13-admin-panel)
  - [FR-14: File Uploads](#fr-14-file-uploads)
  - [FR-15: User Profile](#fr-15-user-profile)
- [Non-Functional Requirements](#non-functional-requirements)
- [Technical Constraints](#technical-constraints)
- [Data Requirements](#data-requirements)
- [API Requirements](#api-requirements)
- [Security Requirements](#security-requirements)
- [Accessibility Requirements](#accessibility-requirements)
- [Future Enhancements](#future-enhancements)

---

## Product Vision

> **CivicPulse** empowers citizens to report civic issues (potholes, broken streetlights, water supply problems, etc.) and hold government departments accountable through transparent tracking, verifiable audit trails, and community engagement.

### Goals
1. Provide citizens with an easy way to report and track civic issues
2. Enable government departments to manage and resolve issues efficiently
3. Create transparency through public dashboards and performance metrics
4. Build community engagement through forums and voting mechanisms
5. Ensure accountability through comprehensive, tamper-resistant audit trails

---

## Stakeholders & Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **Citizen** | General public user who reports issues and participates in community | Basic: report, view, comment, vote |
| **Department Staff** | Government employee assigned to resolve issues | Moderate: view assigned, update status, comment |
| **Department Admin** | Head of a government department | High: manage staff, assign issues, view department analytics |
| **Super Admin** | Platform administrator | Full: manage all users, departments, system settings |

---

## Functional Requirements

### FR-01: User Authentication

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01.1 | Citizens shall register with name, email, phone, and password | **Must Have** | ✅ |
| FR-01.2 | Users shall log in with email and password | **Must Have** | ✅ |
| FR-01.3 | System shall issue JWT access tokens (short-lived) and refresh tokens (long-lived) | **Must Have** | ✅ |
| FR-01.4 | System shall support secure token rotation (revoke old refresh tokens on use) | **Must Have** | ✅ |
| FR-01.5 | Users shall be able to log out (revoke refresh token) | **Must Have** | ✅ |
| FR-01.6 | System shall verify email addresses via OTP or email link | **Should Have** | 🔴 |
| FR-01.7 | Users shall be able to reset forgotten passwords | **Should Have** | 🔴 |
| FR-01.8 | System shall support OAuth2 social login (Google) | **Could Have** | 🔴 |
| FR-01.9 | Admin shall be able to create Department Staff and Admin accounts | **Must Have** | ✅ |

### FR-02: Issue Reporting

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-02.1 | Citizens shall create issue reports with title, description, and category | **Must Have** | ✅ |
| FR-02.2 | Citizens shall attach up to 5 photos/files as evidence per issue | **Must Have** | ✅ |
| FR-02.3 | System shall capture geolocation (lat/lng) via map or GPS | **Must Have** | ✅ (schema) |
| FR-02.4 | Citizens shall provide address details (ward, locality, city, state, pincode) | **Must Have** | ✅ (schema) |
| FR-02.5 | Citizens shall be able to report anonymously | **Should Have** | ✅ (schema) |
| FR-02.6 | System shall auto-assign priority based on category defaults | **Should Have** | ✅ |
| FR-02.7 | System shall auto-calculate SLA deadline based on priority | **Must Have** | ✅ |
| FR-02.8 | System shall generate a unique tracking ID per issue | **Must Have** | ✅ |
| FR-02.9 | Supported file types: JPEG, PNG, PDF (max 5MB per file) | **Must Have** | ✅ |

### FR-03: Issue Tracking & Lifecycle

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-03.1 | Issues shall transition through statuses: SUBMITTED → UNDER_REVIEW → IN_PROGRESS → RESOLVED/REJECTED | **Must Have** | ✅ |
| FR-03.2 | Every status change shall be recorded in a history log with timestamp, user, and remarks | **Must Have** | ✅ |
| FR-03.3 | Citizens shall view all their reported issues with status | **Must Have** | ✅ |
| FR-03.4 | Citizens shall view detailed issue information including timeline | **Must Have** | ✅ |
| FR-03.5 | Users shall add comments to issues (threaded replies) | **Must Have** | ✅ |
| FR-03.6 | Issues shall be filterable by status, priority, category, location | **Must Have** | ✅ |
| FR-03.7 | Issues shall be searchable by keyword (title, description) | **Should Have** | ✅ |
| FR-03.8 | Issues shall support pagination and sorting | **Must Have** | ✅ |

### FR-04: Department Management

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-04.1 | Super Admin shall CRUD government departments | **Must Have** | ✅ |
| FR-04.2 | Departments shall have: name, code, description, contact info, jurisdiction | **Must Have** | ✅ |
| FR-04.3 | Departments shall be activatable/deactivatable | **Should Have** | ✅ |
| FR-04.4 | Departments shall have performance metrics (resolution rate, avg time) | **Should Have** | 🔴 |

### FR-05: Issue Assignment

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-05.1 | Admin shall manually assign issues to departments and staff | **Must Have** | ✅ |
| FR-05.2 | Assignment shall include remarks and track timestamps (assigned, accepted, completed) | **Must Have** | ✅ |
| FR-05.3 | Staff shall accept/acknowledge assigned issues | **Should Have** | ✅ |
| FR-05.4 | System shall auto-assign based on category-department mapping | **Could Have** | 🔴 |
| FR-05.5 | System shall balance workload among available staff | **Could Have** | 🔴 |

### FR-06: SLA Management

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-06.1 | Each issue shall have an SLA deadline based on priority | **Must Have** | ✅ |
| FR-06.2 | System shall run periodic SLA checks (configurable interval) | **Must Have** | ✅ |
| FR-06.3 | System shall mark SLA as breached when deadline passes without resolution | **Must Have** | ✅ |
| FR-06.4 | System shall send SLA_WARNING notification before breach | **Must Have** | ✅ |
| FR-06.5 | System shall send SLA_BREACHED notification on breach | **Must Have** | ✅ |
| FR-06.6 | SLA target hours: LOW=72h, MEDIUM=48h, HIGH=24h, URGENT=12h | **Must Have** | ✅ |

### FR-07: Notifications

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-07.1 | System shall create in-app notifications for: issue creation, status change, assignment, comments, SLA events | **Must Have** | ✅ |
| FR-07.2 | Users shall view all their notifications | **Must Have** | ✅ |
| FR-07.3 | Users shall mark notifications as read | **Must Have** | ✅ |
| FR-07.4 | System shall purge notifications older than 90 days | **Should Have** | ✅ |
| FR-07.5 | System shall support real-time notifications via WebSocket | **Should Have** | 🔴 |
| FR-07.6 | System shall support email notifications | **Could Have** | 🔴 |
| FR-07.7 | System shall support push notifications (mobile) | **Could Have** | 🔴 |

### FR-08: Community Forum

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-08.1 | Citizens shall create community posts with title, content, and optional image | **Must Have** | ✅ |
| FR-08.2 | Posts shall be associated with locality/city for local relevance | **Must Have** | ✅ |
| FR-08.3 | Users shall comment on community posts | **Must Have** | ✅ |
| FR-08.4 | Posts shall be listable with pagination | **Must Have** | ✅ |
| FR-08.5 | Users shall upvote/like posts | **Should Have** | 🔴 |
| FR-08.6 | Admins shall moderate posts (flag, hide, delete) | **Should Have** | 🔴 |

### FR-09: Citizen Feedback

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-09.1 | Citizens shall rate resolved issues on a 1-5 scale | **Must Have** | ✅ |
| FR-09.2 | Citizens shall optionally add a text comment with feedback | **Must Have** | ✅ |
| FR-09.3 | Each issue shall accept only one feedback (1:1 relationship) | **Must Have** | ✅ |
| FR-09.4 | Feedback shall be visible on the issue detail page | **Should Have** | ✅ |
| FR-09.5 | Aggregate feedback ratings shall be shown per department | **Should Have** | 🔴 |

### FR-10: Analytics & Transparency

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-10.1 | Public transparency dashboard showing issue resolution rates | **Must Have** | ✅ (API) |
| FR-10.2 | Dashboard shall show total issues, resolved, pending, by category | **Must Have** | ✅ |
| FR-10.3 | Dashboard shall show average resolution time | **Should Have** | 🔴 |
| FR-10.4 | Dashboard shall show SLA compliance rate per department | **Should Have** | 🔴 |
| FR-10.5 | Admin shall view time-series trends (issues per week/month) | **Could Have** | 🔴 |
| FR-10.6 | Dashboard shall show geographic heatmap of issues | **Could Have** | 🔴 |

### FR-11: E-Voting / Polls

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-11.1 | Admins shall create elections/polls with title, description, options, and timeline | **Must Have** | ✅ |
| FR-11.2 | Elections shall have statuses: UPCOMING → ONGOING → COMPLETED/CANCELLED | **Must Have** | ✅ |
| FR-11.3 | Verified citizens shall cast one vote per election (anonymous) | **Must Have** | ✅ |
| FR-11.4 | Votes shall be stored with a hashed voter reference (not direct user link) | **Must Have** | ✅ |
| FR-11.5 | Vote results shall be calculated and stored | **Must Have** | ✅ |

### FR-12: System Audit Trail

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-12.1 | System shall record issue lifecycle events in IssueStatusHistory table | **Must Have** | ✅ |
| FR-12.2 | Audit records shall include user ID, old/new status, timestamp, and optional reason | **Must Have** | ✅ |
| FR-12.3 | Citizens shall view complete status change history for any public issue | **Must Have** | ✅ |

### FR-13: Admin Panel

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-13.1 | Admin web app with dedicated dashboard | **Must Have** | 🔴 |
| FR-13.2 | Issue management with filters, search, bulk actions | **Must Have** | 🔴 |
| FR-13.3 | Department and staff management | **Must Have** | 🔴 |
| FR-13.4 | User management (view, edit, deactivate) | **Must Have** | 🔴 |
| FR-13.5 | SLA monitoring dashboard | **Should Have** | 🔴 |
| FR-13.6 | System settings management | **Could Have** | 🔴 |

### FR-14: File Uploads

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-14.1 | System shall accept file uploads up to 5MB | **Must Have** | ✅ |
| FR-14.2 | System shall validate file type (JPEG, PNG, PDF) | **Must Have** | ✅ |
| FR-14.3 | Uploaded files shall be served via static file endpoint | **Must Have** | ✅ |
| FR-14.4 | System shall generate thumbnails for images | **Could Have** | 🔴 |
| FR-14.5 | System shall support cloud storage (S3/Cloudinary) | **Could Have** | 🔴 |

### FR-15: User Profile

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-15.1 | Users shall view their profile information | **Must Have** | ✅ |
| FR-15.2 | Users shall update their name and phone number | **Must Have** | ✅ |
| FR-15.3 | Users shall change their password | **Should Have** | ✅ |
| FR-15.4 | Users shall upload a profile picture | **Could Have** | 🔴 |

---

## Non-Functional Requirements

### Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | API response time for list endpoints | < 500ms (p95) |
| NFR-02 | API response time for single-resource endpoints | < 200ms (p95) |
| NFR-03 | Page load time (citizen web) | < 3 seconds (FCP) |
| NFR-04 | Concurrent user support | ≥ 500 simultaneous users |
| NFR-05 | File upload processing time | < 5 seconds for 5MB file |
| NFR-06 | Database query optimization | All list queries use indexed fields |

### Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-07 | API uptime | 99.5% |
| NFR-08 | Graceful error handling | All errors return standardized JSON |
| NFR-09 | Database connection resilience | Auto-reconnect on connection loss |
| NFR-10 | Background job fault tolerance | Failed jobs logged, don't crash server |

### Scalability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-11 | Horizontal scaling readiness | Stateless API design |
| NFR-12 | Database scalability | Connection pooling via Prisma |
| NFR-13 | File storage scalability | Configurable storage backend |

### Maintainability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-14 | Code modularity | Feature-based module architecture |
| NFR-15 | Test coverage | ≥ 70% for backend services |
| NFR-16 | Documentation | All APIs documented with examples |
| NFR-17 | Code style consistency | ESLint + Prettier enforced |

### Usability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-18 | Mobile-responsive design | Works on 320px-1920px screens |
| NFR-19 | Intuitive issue reporting | ≤ 3 steps to submit an issue |
| NFR-20 | Multi-language support (future) | i18n-ready architecture |
| NFR-21 | Accessibility | WCAG 2.1 AA compliance |

---

## Technical Constraints

| Constraint | Details |
|------------|---------|
| **Runtime** | Node.js ≥ 20.x |
| **Database** | PostgreSQL ≥ 16 |
| **ORM** | Prisma 6.x (no raw SQL unless absolutely needed) |
| **API Style** | REST (no GraphQL in v1) |
| **Auth** | JWT only (no session cookies) |
| **File Storage** | Local disk in dev, cloud storage in prod |
| **Browser Support** | Chrome, Firefox, Safari, Edge (latest 2 versions) |

---

## Data Requirements

### Data Retention

| Data Type | Retention Period |
|-----------|-----------------|
| User accounts | Indefinite (until deleted) |
| Issues | Indefinite |
| Issue evidence | Indefinite |
| Notifications | 90 days |
| Refresh tokens | Until expiry or revocation |
| Audit history logs | Indefinite |

### Data Privacy

| Requirement | Details |
|-------------|---------|
| No raw Aadhaar/SSN storage | Only hashed identity proofs |
| Anonymous reporting | `isAnonymous` flag hides reporter identity |
| Anonymous voting | Voter hash decoupled from user ID |
| Password storage | bcrypt with appropriate salt rounds |
| GDPR-readiness | User deletion cascades to all related data |

---

## API Requirements

| Requirement | Details |
|-------------|---------|
| Base URL | `/api` prefix for all routes |
| Content Type | `application/json` (except file uploads: `multipart/form-data`) |
| Authentication | `Authorization: Bearer <token>` header |
| Pagination | Query params: `page`, `limit`, `sortBy`, `sortOrder` |
| Error Format | `{ success: false, error: "message", statusCode: 4xx/5xx }` |
| Rate Limiting | Configurable per-endpoint limits |
| CORS | Configurable allowed origins |
| Versioning | No URL versioning in v1 (planned: `/api/v2/...`) |

---

## Security Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| SEC-01 | All passwords hashed with bcrypt | **Must Have** ✅ |
| SEC-02 | JWT tokens with configurable expiry | **Must Have** ✅ |
| SEC-03 | Refresh token rotation (revoke on use) | **Must Have** ✅ |
| SEC-04 | RBAC on all protected endpoints | **Must Have** ✅ |
| SEC-05 | Input validation on all API inputs (Zod) | **Must Have** ✅ |
| SEC-06 | Rate limiting on auth endpoints | **Must Have** ✅ |
| SEC-07 | CORS configuration | **Must Have** ✅ |
| SEC-08 | File upload size and type restrictions | **Must Have** ✅ |
| SEC-09 | SQL injection prevention (Prisma ORM) | **Must Have** ✅ |
| SEC-10 | Security headers (Helmet.js) | **Should Have** 🔴 |
| SEC-11 | CSRF protection | **Should Have** 🔴 |
| SEC-12 | Content Security Policy | **Should Have** 🔴 |

---

## Accessibility Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| A11Y-01 | All images must have alt text | **Must Have** |
| A11Y-02 | All form inputs must have labels | **Must Have** |
| A11Y-03 | Keyboard navigation for all interactive elements | **Must Have** |
| A11Y-04 | Color contrast ratio ≥ 4.5:1 for text | **Must Have** |
| A11Y-05 | Screen reader compatibility | **Should Have** |
| A11Y-06 | Focus indicators on interactive elements | **Must Have** |
| A11Y-07 | Semantic HTML (proper heading hierarchy) | **Must Have** |

---

## Future Enhancements

| Feature | Description | Timeline |
|---------|-------------|----------|
| **Mobile Apps** | React Native apps for citizens and admins | Phase 2 |
| **Real-Time Notifications** | WebSocket-based live updates | Phase 2 |
| **Email Notifications** | Transactional emails for key events | Phase 2 |
| **Smart Contract Integration** | Deploy and connect audit trail contracts | Phase 3 |
| **Multi-Language (i18n)** | Hindi, regional language support | Phase 3 |
| **AI Issue Classification** | Auto-categorize and route issues using ML | Phase 3 |
| **Public API** | Third-party access to anonymized issue data | Phase 3 |
| **SMS Notifications** | For low-connectivity areas | Phase 3 |
| **Offline Mode** | Mobile app works offline with sync | Phase 4 |
| **Advanced Analytics** | Predictive analytics, trend forecasting | Phase 4 |
]]>
