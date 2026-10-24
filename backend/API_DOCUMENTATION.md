# 🏛️ CivicPulse — Backend API Documentation

> **Base URL:** `http://localhost:5000`  
> **API Prefix:** `/api/v1`  
> **Rate Limit:** Applied globally on all `/api/v1/*` routes  

---

## 📋 Table of Contents

| # | Module | Prefix | Endpoints |
|---|--------|--------|-----------|
| 1 | [Health & Root](#1-health--root) | `/` | 2 |
| 2 | [Auth](#2-auth) | `/api/v1/auth` | 8 |
| 3 | [Users](#3-users) | `/api/v1/users` | 5 |
| 4 | [Citizens](#4-citizens) | `/api/v1/citizens` | 2 |
| 5 | [Issues](#5-issues) | `/api/v1/issues` | 8 |
| 6 | [Departments](#6-departments) | `/api/v1/departments` | 5 |
| 7 | [Assignments](#7-assignments) | `/api/v1/assignments` | 5 |
| 8 | [Community](#8-community) | `/api/v1/community` | 9 |
| 9 | [Polls / Elections](#9-polls--elections) | `/api/v1/polls` | 5 |
| 10 | [Notifications](#10-notifications) | `/api/v1/notifications` | 3 |
| 11 | [Analytics](#11-analytics) | `/api/v1/analytics` | 2 |
| 12 | [Uploads](#12-uploads) | `/api/v1/uploads` | 1 |
| 13 | [Feedback](#13-feedback) | `/api/v1/feedback` | 2 |
| 14 | [Admin](#14-admin) | `/api/v1/admin` | 1 |
|   | **Total** | | **58** |

---

## Authentication

All authenticated routes require a **Bearer token** in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Roles

| Role | Description |
|------|-------------|
| `CITIZEN` | Regular citizen user |
| `DEPARTMENT_STAFF` | Staff member assigned to a department |
| `DEPARTMENT_ADMIN` | Administrator of a department |
| `SUPER_ADMIN` | Platform super administrator |

---

## Standard Response Format

### ✅ Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### ❌ Error
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

---

## 1. Health & Root

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | ❌ No | API status check |
| `GET` | `/health` | ❌ No | Health check |

#### `GET /`

**Response:**
```json
{
  "success": true,
  "message": "CivicPulse API is running"
}
```

#### `GET /health`

**Response:**
```json
{
  "success": true,
  "status": "healthy"
}
```

---

## 2. Auth

**Prefix:** `/api/v1/auth`

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| `POST` | `/auth/register` | ❌ No | Default | Register a new citizen |
| `POST` | `/auth/login` | ❌ No | 10 req / 15 min | Login user |
| `GET` | `/auth/magistrates` | ❌ No | Default | Get list of sector magistrates |
| `POST` | `/auth/google` | ❌ No | Default | Google OAuth sign-in / register |
| `POST` | `/auth/refresh-token` | ❌ No | Default | Refresh access token |
| `POST` | `/auth/logout` | ✅ Yes | Default | Logout (revoke refresh token) |
| `POST` | `/auth/logout-all` | ✅ Yes | Default | Logout all sessions |
| `POST` | `/auth/change-password` | ✅ Yes | Default | Change password |
| `GET` | `/auth/me` | ✅ Yes | Default | Get current authenticated user |

---

### `POST /api/v1/auth/register`

Register a new citizen account.

**Request Body:**
```json
{
  "name": "string (2–100 chars, required)",
  "email": "string (valid email, required)",
  "password": "string (6–128 chars, required)",
  "phone": "string (optional)"
}
```

**Response:** `201 Created`

---

### `POST /api/v1/auth/login`

Login with email and password. Rate limited to **10 requests per 15 minutes**.

**Request Body:**
```json
{
  "email": "string (valid email, required)",
  "password": "string (required)"
}
```

**Response:** `200 OK` — Returns access token, refresh token, and user data.

---

### `GET /api/v1/auth/magistrates`

Get the list of official sector magistrates from the database.

**Response:** `200 OK`

---

### `POST /api/v1/auth/google`

Sign in or register using Google OAuth token exchange.

**Request Body:**
```json
{
  "credential": "string (Google ID token)"
}
```

**Response:** `200 OK`

---

### `POST /api/v1/auth/refresh-token`

Refresh the access token using a refresh token (no JWT needed).

**Request Body:**
```json
{
  "refreshToken": "string (required)"
}
```

**Response:** `200 OK` — Returns new access token.

---

### `POST /api/v1/auth/logout`

🔒 **Auth Required**

Revoke the provided refresh token.

**Request Body:**
```json
{
  "refreshToken": "string (optional)"
}
```

**Response:** `200 OK`

---

### `POST /api/v1/auth/logout-all`

🔒 **Auth Required**

Revoke all refresh tokens for the authenticated user.

**Response:** `200 OK`

---

### `POST /api/v1/auth/change-password`

🔒 **Auth Required**

Change the user's password.

**Request Body:**
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (12–128 chars, required)"
}
```

**Response:** `200 OK`

---

### `GET /api/v1/auth/me`

🔒 **Auth Required**

Get the currently authenticated user's profile.

**Response:** `200 OK`

---

## 3. Users

**Prefix:** `/api/v1/users`  
🔒 **All routes require authentication**

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `GET` | `/users/me` | ✅ | Any | Get own profile |
| `PATCH` | `/users/me` | ✅ | Any | Update own profile |
| `GET` | `/users` | ✅ | `SUPER_ADMIN`, `DEPARTMENT_ADMIN` | Get all users (with filters) |
| `GET` | `/users/:id` | ✅ | `SUPER_ADMIN`, `DEPARTMENT_ADMIN` | Get single user by ID |
| `PATCH` | `/users/:id/role` | ✅ | `SUPER_ADMIN` | Update user role |
| `PATCH` | `/users/:id/status` | ✅ | `SUPER_ADMIN` | Activate / deactivate user |

---

### `GET /api/v1/users/me`

Get own profile.

**Response:** `200 OK`

---

### `PATCH /api/v1/users/me`

Update own profile (name, phone).

**Request Body:**
```json
{
  "name": "string (optional)",
  "phone": "string (optional)"
}
```

**Response:** `200 OK`

---

### `GET /api/v1/users`

🔒 **Roles:** `SUPER_ADMIN`, `DEPARTMENT_ADMIN`

Get all users with optional filters.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `role` | string | Filter by role (e.g., `CITIZEN`) |
| `isActive` | boolean | Filter by active status |
| `search` | string | Search by name or email |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

**Response:** `200 OK`

---

### `GET /api/v1/users/:id`

🔒 **Roles:** `SUPER_ADMIN`, `DEPARTMENT_ADMIN`

Get a single user by their ID.

**Response:** `200 OK`

---

### `PATCH /api/v1/users/:id/role`

🔒 **Roles:** `SUPER_ADMIN`

Update a user's role.

**Request Body:**
```json
{
  "role": "CITIZEN | DEPARTMENT_STAFF | DEPARTMENT_ADMIN | SUPER_ADMIN"
}
```

**Response:** `200 OK`

---

### `PATCH /api/v1/users/:id/status`

🔒 **Roles:** `SUPER_ADMIN`

Toggle a user's active/inactive status.

**Response:** `200 OK`

---

## 4. Citizens

**Prefix:** `/api/v1/citizens`  
🔒 **All routes require authentication**  
🔒 **Role:** `CITIZEN` only

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/citizens/me/dashboard` | ✅ | Get citizen dashboard stats |
| `POST` | `/citizens/me/verify` | ✅ | Verify citizen identity |

---

### `GET /api/v1/citizens/me/dashboard`

Get dashboard statistics for the logged-in citizen.

**Response:** `200 OK`

---

### `POST /api/v1/citizens/me/verify`

Submit identity verification for the citizen.

**Request Body:**
```json
{
  "voterIdNumber": "string (required)"
}
```

**Response:** `200 OK`

---

## 5. Issues

**Prefix:** `/api/v1/issues`

| Method | Endpoint | Auth | Roles / Permission | Description |
|--------|----------|------|--------------------|-------------|
| `GET` | `/issues/categories` | ❌ No | Public | Get all issue categories |
| `GET` | `/issues/sectors` | ❌ No | Public | Get all municipal sectors |
| `GET` | `/issues/sectors/workload` | ❌ No | Public | Get sector workload stats |
| `GET` | `/issues/my` | ✅ | Any | Get my reported issues |
| `GET` | `/issues/:issueId/assignments` | ✅ | `DEPT_STAFF`, `DEPT_ADMIN`, `SUPER_ADMIN` | Get assignments for an issue |
| `POST` | `/issues` | ✅ | Permission: `ISSUE_CREATE` | Create a new issue |
| `GET` | `/issues` | ✅ | Any | Get all issues (filtered) |
| `GET` | `/issues/:id` | ✅ | Any | Get single issue by ID |
| `GET` | `/issues/:id/history` | ✅ | Any | Get status history for an issue |
| `PATCH` | `/issues/:id/status` | ✅ | Permission: `ISSUE_UPDATE_STATUS` | Update issue status |

---

### `GET /api/v1/issues/categories`

Get all issue categories (for dropdowns).

**Response:** `200 OK`

---

### `GET /api/v1/issues/sectors`

Get all municipal sectors for Dehradun.

**Response:** `200 OK`

---

### `GET /api/v1/issues/sectors/workload`

Get real-time sector workload and load balancing statistics.

**Response:** `200 OK`

---

### `GET /api/v1/issues/my`

🔒 **Auth Required**

Get issues reported by the authenticated user.

**Response:** `200 OK`

---

### `GET /api/v1/issues/:issueId/assignments`

🔒 **Roles:** `DEPARTMENT_STAFF`, `DEPARTMENT_ADMIN`, `SUPER_ADMIN`

Get all assignments for a specific issue.

**Response:** `200 OK`

---

### `POST /api/v1/issues`

🔒 **Permission:** `ISSUE_CREATE`

Create a new issue report.

**Request Body:**
```json
{
  "title": "string (5–150 chars, required)",
  "description": "string (10–5000 chars, required)",
  "categoryId": "string (UUID, required)",
  "priority": "LOW | MEDIUM | HIGH | URGENT (optional, default: MEDIUM)",
  "latitude": "number (-90 to 90, optional)",
  "longitude": "number (-180 to 180, optional)",
  "address": "string (max 500 chars, optional)",
  "sector": "string (max 150 chars, optional)",
  "ward": "string (max 100 chars, optional)",
  "locality": "string (max 200 chars, optional)",
  "city": "string (max 100 chars, optional)",
  "state": "string (max 100 chars, optional)",
  "pincode": "string (6-digit number, optional)",
  "isAnonymous": "boolean (optional)"
}
```

**Response:** `201 Created`

---

### `GET /api/v1/issues`

🔒 **Auth Required**

Get all issues with filters and pagination.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status |
| `category` | string | Filter by category |
| `priority` | string | Filter by priority |
| `sector` | string | Filter by sector |
| `search` | string | Search in title/description |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response:** `200 OK`

---

### `GET /api/v1/issues/:id`

🔒 **Auth Required**

Get a single issue by ID with full details.

**Response:** `200 OK`

---

### `GET /api/v1/issues/:id/history`

🔒 **Auth Required**

Get the complete status change history for an issue.

**Response:** `200 OK`

---

### `PATCH /api/v1/issues/:id/status`

🔒 **Permission:** `ISSUE_UPDATE_STATUS`

Update the status of an issue (staff/admin only).

**Request Body:**
```json
{
  "status": "SUBMITTED | UNDER_REVIEW | IN_PROGRESS | RESOLVED | REJECTED (required)",
  "remarks": "string (max 2000 chars, optional)",
  "resolutionProofUrl": "string (optional)",
  "broadcastToTransparency": "boolean (optional)"
}
```

**Response:** `200 OK`

---

## 6. Departments

**Prefix:** `/api/v1/departments`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `GET` | `/departments` | ❌ No | Public | List all departments |
| `GET` | `/departments/:id` | ❌ No | Public | Get single department |
| `GET` | `/departments/:id/staff` | ✅ | `SUPER_ADMIN`, `DEPARTMENT_ADMIN` | Get department staff |
| `POST` | `/departments` | ✅ | `SUPER_ADMIN` | Create a new department |
| `PATCH` | `/departments/:id` | ✅ | `SUPER_ADMIN` | Update a department |
| `PATCH` | `/departments/:id/status` | ✅ | `SUPER_ADMIN` | Activate / deactivate department |

---

### `GET /api/v1/departments`

Get all departments (for dropdowns, public-facing pages).

**Response:** `200 OK`

---

### `GET /api/v1/departments/:id`

Get a single department by ID.

**Response:** `200 OK`

---

### `GET /api/v1/departments/:id/staff`

🔒 **Roles:** `SUPER_ADMIN`, `DEPARTMENT_ADMIN`

Get staff members associated with a department.

**Response:** `200 OK`

---

### `POST /api/v1/departments`

🔒 **Roles:** `SUPER_ADMIN`

Create a new department.

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "contactEmail": "string (optional)",
  "contactPhone": "string (optional)"
}
```

**Response:** `201 Created`

---

### `PATCH /api/v1/departments/:id`

🔒 **Roles:** `SUPER_ADMIN`

Update an existing department.

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "contactEmail": "string (optional)",
  "contactPhone": "string (optional)"
}
```

**Response:** `200 OK`

---

### `PATCH /api/v1/departments/:id/status`

🔒 **Roles:** `SUPER_ADMIN`

Toggle the active/inactive status of a department.

**Response:** `200 OK`

---

## 7. Assignments

**Prefix:** `/api/v1/assignments`  
🔒 **All routes require authentication**

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `GET` | `/assignments/my` | ✅ | Any | Get my assignments |
| `GET` | `/assignments` | ✅ | `SUPER_ADMIN`, `DEPARTMENT_ADMIN` | Get all assignments (filtered) |
| `POST` | `/assignments` | ✅ | `SUPER_ADMIN`, `DEPARTMENT_ADMIN` | Assign issue to department/staff |
| `GET` | `/assignments/:id` | ✅ | Any | Get assignment by ID |
| `PATCH` | `/assignments/:id/accept` | ✅ | `DEPARTMENT_STAFF`, `DEPARTMENT_ADMIN` | Accept an assignment |
| `PATCH` | `/assignments/:id/complete` | ✅ | `DEPARTMENT_STAFF`, `DEPARTMENT_ADMIN` | Complete an assignment |

---

### `GET /api/v1/assignments/my`

Get assignments assigned to the authenticated user.

**Response:** `200 OK`

---

### `GET /api/v1/assignments`

🔒 **Roles:** `SUPER_ADMIN`, `DEPARTMENT_ADMIN`

Get all assignments with optional filters.

**Response:** `200 OK`

---

### `POST /api/v1/assignments`

🔒 **Roles:** `SUPER_ADMIN`, `DEPARTMENT_ADMIN`

Assign an issue to a department or staff member.

**Request Body:**
```json
{
  "issueId": "string (UUID, required)",
  "assigneeId": "string (UUID, required)",
  "departmentId": "string (UUID, required)",
  "notes": "string (optional)"
}
```

**Response:** `201 Created`

---

### `GET /api/v1/assignments/:id`

Get a single assignment by ID.

**Response:** `200 OK`

---

### `PATCH /api/v1/assignments/:id/accept`

🔒 **Roles:** `DEPARTMENT_STAFF`, `DEPARTMENT_ADMIN`

Accept a pending assignment.

**Response:** `200 OK`

---

### `PATCH /api/v1/assignments/:id/complete`

🔒 **Roles:** `DEPARTMENT_STAFF`, `DEPARTMENT_ADMIN`

Mark an assignment as completed.

**Request Body:**
```json
{
  "completionNotes": "string (optional)",
  "resolutionProofUrl": "string (optional)"
}
```

**Response:** `200 OK`

---

## 8. Community

**Prefix:** `/api/v1/community`  
🔒 **All routes require authentication**

### Community Posts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/community/posts` | ✅ | Create a community post |
| `GET` | `/community/posts` | ✅ | List all community posts |
| `GET` | `/community/posts/:id` | ✅ | Get single post by ID |
| `DELETE` | `/community/posts/:id` | ✅ | Delete a post (owner or admin) |

### Post Comments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/community/posts/:postId/comments` | ✅ | Add comment to a post |
| `GET` | `/community/posts/:postId/comments` | ✅ | Get comments for a post |
| `DELETE` | `/community/post-comments/:id` | ✅ | Delete a post comment (owner or admin) |

### Issue Comments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/community/issues/:issueId/comments` | ✅ | Add comment to an issue |
| `GET` | `/community/issues/:issueId/comments` | ✅ | Get comments for an issue (threaded) |
| `PATCH` | `/community/issue-comments/:id` | ✅ | Update an issue comment (owner only) |
| `DELETE` | `/community/issue-comments/:id` | ✅ | Delete an issue comment (owner or admin) |

---

### `POST /api/v1/community/posts`

Create a new community post.

**Request Body:**
```json
{
  "title": "string (required)",
  "content": "string (required)",
  "type": "string (optional)"
}
```

**Response:** `201 Created`

---

### `GET /api/v1/community/posts`

List all community posts with pagination.

**Response:** `200 OK`

---

### `GET /api/v1/community/posts/:id`

Get a single community post by ID.

**Response:** `200 OK`

---

### `DELETE /api/v1/community/posts/:id`

Delete a community post (owner or admin only).

**Response:** `200 OK`

---

### `POST /api/v1/community/posts/:postId/comments`

Add a comment to a community post.

**Request Body:**
```json
{
  "content": "string (required)"
}
```

**Response:** `201 Created`

---

### `GET /api/v1/community/posts/:postId/comments`

Get all comments for a community post.

**Response:** `200 OK`

---

### `DELETE /api/v1/community/post-comments/:id`

Delete a post comment (owner or admin only).

**Response:** `200 OK`

---

### `POST /api/v1/community/issues/:issueId/comments`

Add a comment to an issue.

**Request Body:**
```json
{
  "content": "string (required)",
  "parentId": "string (UUID, optional — for threaded replies)"
}
```

**Response:** `201 Created`

---

### `GET /api/v1/community/issues/:issueId/comments`

Get threaded comments for an issue (top-level with nested replies).

**Response:** `200 OK`

---

### `PATCH /api/v1/community/issue-comments/:id`

Update an issue comment (owner only).

**Request Body:**
```json
{
  "content": "string (required)"
}
```

**Response:** `200 OK`

---

### `DELETE /api/v1/community/issue-comments/:id`

Delete an issue comment (owner or admin only).

**Response:** `200 OK`

---

## 9. Polls / Elections

**Prefix:** `/api/v1/polls`  
🔒 **All routes require authentication**

| Method | Endpoint | Auth | Permission | Description |
|--------|----------|------|------------|-------------|
| `POST` | `/polls` | ✅ | `POLL_CREATE` | Create a new election/poll |
| `PATCH` | `/polls/:id/status` | ✅ | `POLL_UPDATE_STATUS` | Update election status |
| `GET` | `/polls` | ✅ | Any | Get all elections |
| `GET` | `/polls/:id` | ✅ | Any | Get election by ID |
| `GET` | `/polls/:id/results` | ✅ | Any | Get election results |
| `POST` | `/polls/:id/vote` | ✅ | `POLL_VOTE` + Verified Identity | Cast a vote |

---

### `POST /api/v1/polls`

🔒 **Permission:** `POLL_CREATE` (Admin only)

Create a new election or poll.

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "type": "string (optional)",
  "startDate": "ISO 8601 datetime (required)",
  "endDate": "ISO 8601 datetime (required)",
  "candidates": [
    {
      "name": "string (required)",
      "description": "string (optional)"
    }
  ]
}
```

**Response:** `201 Created`

---

### `PATCH /api/v1/polls/:id/status`

🔒 **Permission:** `POLL_UPDATE_STATUS`

Update the status of an election (e.g., activate, close).

**Request Body:**
```json
{
  "status": "string (required)"
}
```

**Response:** `200 OK`

---

### `GET /api/v1/polls`

Get all elections/polls.

**Response:** `200 OK`

---

### `GET /api/v1/polls/:id`

Get a single election/poll by ID.

**Response:** `200 OK`

---

### `GET /api/v1/polls/:id/results`

Get the results/vote tally for an election.

**Response:** `200 OK`

---

### `POST /api/v1/polls/:id/vote`

🔒 **Permission:** `POLL_VOTE`  
🔒 **Requires:** Verified Identity

Cast a vote in an election.

**Request Body:**
```json
{
  "candidateId": "string (UUID, required)"
}
```

**Response:** `200 OK`

---

## 10. Notifications

**Prefix:** `/api/v1/notifications`  
🔒 **All routes require authentication**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/notifications` | ✅ | List notifications for current user |
| `PATCH` | `/notifications/read-all` | ✅ | Mark all notifications as read |
| `PATCH` | `/notifications/:id/read` | ✅ | Mark a single notification as read |

---

### `GET /api/v1/notifications`

Get all notifications for the authenticated user.

**Response:** `200 OK`

---

### `PATCH /api/v1/notifications/read-all`

Mark all notifications as read.

**Response:** `200 OK`

---

### `PATCH /api/v1/notifications/:id/read`

Mark a single notification as read.

**Response:** `200 OK`

---

## 11. Analytics

**Prefix:** `/api/v1/analytics`  
🔒 **All routes require authentication**  
🔒 **Permission:** `ANALYTICS_VIEW`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/analytics/overview` | ✅ | Get platform analytics overview |
| `GET` | `/analytics/categories` | ✅ | Get category-wise performance |

---

### `GET /api/v1/analytics/overview`

Get high-level platform analytics (total issues, resolution rates, etc.).

**Response:** `200 OK`

---

### `GET /api/v1/analytics/categories`

Get performance metrics broken down by issue category.

**Response:** `200 OK`

---

## 12. Uploads

**Prefix:** `/api/v1/uploads`  
🔒 **All routes require authentication**

| Method | Endpoint | Auth | Permission | Description |
|--------|----------|------|------------|-------------|
| `POST` | `/uploads/issues/:issueId/evidence` | ✅ | `EVIDENCE_UPLOAD` + Owner/Admin | Upload evidence for an issue |

---

### `POST /api/v1/uploads/issues/:issueId/evidence`

🔒 **Permission:** `EVIDENCE_UPLOAD`  
🔒 **Ownership:** Must be the issue reporter, or `SUPER_ADMIN` / `DEPARTMENT_ADMIN`

Upload evidence (images/files) for a specific issue. Send as `multipart/form-data`.

**Request Body:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `evidence` | file | The evidence file to upload |

**Response:** `200 OK`

---

## 13. Feedback

**Prefix:** `/api/v1/feedback`  
🔒 **All routes require authentication**

| Method | Endpoint | Auth | Permission | Description |
|--------|----------|------|------------|-------------|
| `POST` | `/feedback/issues/:issueId` | ✅ | `FEEDBACK_SUBMIT` | Submit feedback for a resolved issue |
| `GET` | `/feedback/issues/:issueId` | ✅ | `FEEDBACK_VIEW` | Get feedback for an issue |

---

### `POST /api/v1/feedback/issues/:issueId`

🔒 **Permission:** `FEEDBACK_SUBMIT`

Submit feedback for a resolved issue (only the original reporter).

**Request Body:**
```json
{
  "rating": "number (1–5, required)",
  "comment": "string (optional)"
}
```

**Response:** `201 Created`

---

### `GET /api/v1/feedback/issues/:issueId`

🔒 **Permission:** `FEEDBACK_VIEW`

Get the feedback submitted for an issue.

**Response:** `200 OK`

---

## 14. Admin

**Prefix:** `/api/v1/admin`  
🔒 **All routes require authentication**  
🔒 **Permission:** `ADMIN_DASHBOARD`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/admin/dashboard` | ✅ | Get admin dashboard data |

---

### `GET /api/v1/admin/dashboard`

🔒 **Permission:** `ADMIN_DASHBOARD`

Get comprehensive admin dashboard data (user stats, issue stats, department performance, etc.).

**Response:** `200 OK`

---

## Static Files

Uploaded files are served statically:

```
GET /uploads/<filename>
```

---

## Error Codes

| Status | Meaning |
|--------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request / Validation Error |
| `401` | Unauthorized (missing or invalid token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not Found |
| `429` | Too Many Requests (rate limited) |
| `500` | Internal Server Error |

---

## CORS

Allowed origins (configured via `.env`):
- `http://localhost:3000` (Citizen Web)
- `http://localhost:3001` (Admin Web)

---

> **Generated from source code — CivicPulse Backend API**  
> **Total Endpoints: 58**
