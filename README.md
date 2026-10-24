<![CDATA[<div align="center">

# 🏛️ CivicPulse

### Citizen Issue Reporting & Government Accountability Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748.svg)](https://www.prisma.io/)

**CivicPulse** bridges the gap between citizens and government departments by providing a transparent, verifiable platform for reporting civic issues, tracking government accountability, and enabling community-driven governance.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔍 Overview

CivicPulse is a full-stack monorepo platform consisting of:

| Application         | Description                                  | Status       |
|---------------------|----------------------------------------------|--------------|
| **Citizen Web**     | Next.js web app for citizens                 | 🟡 In Progress |
| **Admin Web**       | Next.js dashboard for government admins      | 🔴 Scaffolded   |
| **Citizen App**     | React Native mobile app for citizens         | 🔴 Scaffolded   |
| **Admin App**       | React Native mobile app for department staff | 🔴 Scaffolded   |
| **Backend API**     | Express.js REST API with Prisma ORM          | 🟢 Active     |

---

## ✨ Key Features

### 🗳️ Citizen-Facing
- **Issue Reporting** — Report civic issues with geolocation, photos, and categorization
- **Real-Time Tracking** — Track issue status from submission → resolution
- **Community Forum** — Discuss local issues, share updates, and engage neighbors
- **Transparency Dashboard** — View department performance, SLA compliance, and resolution rates
- **Feedback System** — Rate and review resolved issues

### 🏢 Government-Facing
- **Department Management** — Manage departments, staff, and jurisdictions
- **Issue Assignment & Routing** — Auto/manual assign issues to relevant departments
- **SLA Monitoring** — Track service-level agreements with breach alerts
- **Analytics Dashboard** — Comprehensive analytics on issue trends, resolution times
- **Notification Engine** — Push and in-app notifications for all stakeholders

### 🛡️ Public Accountability & Security
- **Immutable Audit Trail** — Tamper-resistant logging of all issue status changes and staff actions
- **Secure E-Voting & Polls** — Anonymized cryptographic voter hashing for community decision-making
- **Identity Verification** — Secure citizen identity verification without exposing sensitive personal data

---

## 🛠️ Tech Stack

| Layer             | Technology                                           |
|-------------------|------------------------------------------------------|
| **Frontend Web**  | Next.js 16, React 19, TypeScript                    |
| **Frontend Mobile** | React Native (planned)                            |
| **Backend API**   | Node.js, Express 5, Zod validation                  |
| **Database**      | PostgreSQL 16, Prisma ORM 6.x                       |
| **Auth**          | JWT (Access + Refresh tokens), bcrypt                |
| **File Storage**  | Local disk (configurable for S3/Cloudinary)          |
| **Testing**       | Node.js native test runner                           |
| **DevOps**        | Docker Compose, Nodemon                              |

---

## 📁 Project Structure

> See [`docs/PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md) for the full annotated directory tree.

```
CivicPulse/
├── apps/                    # Frontend applications
│   ├── citizen-web/         # Next.js — Citizen portal
│   ├── admin-web/           # Next.js — Admin dashboard
│   ├── citizen-app/         # React Native — Citizen mobile
│   └── admin-app/           # React Native — Admin mobile
├── backend/                 # Express.js REST API
│   ├── prisma/              # Database schema, migrations, seeds
│   ├── src/                 # Application source code
│   └── tests/               # API tests
├── docs/                    # Project documentation
│   ├── PROJECT_STRUCTURE.md # Full annotated directory layout
│   ├── TECHNICAL_ARCHITECTURE.md # System design & data flow
│   ├── TASK_TRACKER.md      # Work items per file/module
│   └── REQUIREMENTS.md      # Functional & non-functional requirements
└── README.md                # ← You are here
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20.x
- **npm** ≥ 10.x
- **PostgreSQL** ≥ 16 (or Docker)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/CivicPulse.git
cd CivicPulse
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env          # Configure your database URL & secrets
npm install                    # Install dependencies
npm run db:migrate             # Run Prisma migrations
npm run db:seed                # Seed sample data
npm run dev                    # Start API on http://localhost:5000
```

### 3. Citizen Web Setup

```bash
cd apps/citizen-web
cp .env.local.example .env.local  # Set API URL
npm install
npm run dev                       # Start on http://localhost:3000
```

### 4. Docker (Optional)

```bash
cd backend
docker-compose up -d           # Start PostgreSQL container
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable                       | Description                        | Default                |
|--------------------------------|------------------------------------|------------------------|
| `PORT`                         | API server port                    | `5000`                 |
| `NODE_ENV`                     | Environment mode                   | `development`          |
| `DATABASE_URL`                 | PostgreSQL connection string       | —                      |
| `JWT_SECRET`                   | JWT signing secret                 | —                      |
| `JWT_EXPIRES_IN`               | Token expiry duration              | `7d`                   |
| `VOTER_SECRET`                 | E-voting voter hash secret         | —                      |
| `CORS_ORIGINS`                 | Allowed CORS origins (CSV)         | `http://localhost:3000`|
| `UPLOAD_DIR`                   | File upload directory              | `uploads`              |
| `MAX_UPLOAD_SIZE_BYTES`        | Max upload size                    | `5242880` (5MB)        |
| `ENABLE_BACKGROUND_JOBS`       | Toggle background job scheduler    | `false`                |

### Citizen Web (`apps/citizen-web/.env.local`)

| Variable                       | Description                        | Default                |
|--------------------------------|------------------------------------|------------------------|
| `NEXT_PUBLIC_API_URL`          | Backend API base URL               | `http://localhost:5000`|

---

## 📜 Available Scripts

### Backend

| Command              | Description                              |
|----------------------|------------------------------------------|
| `npm run dev`        | Start development server with hot-reload |
| `npm start`          | Start production server                  |
| `npm test`           | Run all tests                            |
| `npm run test:unit`  | Run unit tests only                      |
| `npm run test:integration` | Run integration tests              |
| `npm run db:migrate` | Run Prisma migrations                    |
| `npm run db:seed`    | Seed the database                        |
| `npm run db:studio`  | Open Prisma Studio GUI                   |
| `npm run db:reset`   | Reset database (destructive!)            |

### Citizen Web

| Command              | Description                              |
|----------------------|------------------------------------------|
| `npm run dev`        | Start Next.js dev server                 |
| `npm run build`      | Build for production                     |
| `npm start`          | Start production server                  |
| `npm run lint`       | Run ESLint                               |

---

## 📖 API Documentation

> See [`docs/api/`](docs/api/) for full API endpoint documentation.

### Quick Reference — Key Endpoints

| Method | Endpoint                    | Description                    | Auth Required |
|--------|-----------------------------|--------------------------------|---------------|
| POST   | `/api/auth/register`        | Register new citizen           | No            |
| POST   | `/api/auth/login`           | Login & get tokens             | No            |
| POST   | `/api/auth/refresh`         | Refresh access token           | No            |
| GET    | `/api/issues`               | List all issues                | Yes           |
| POST   | `/api/issues`               | Create new issue               | Yes           |
| GET    | `/api/issues/:id`           | Get issue details              | Yes           |
| PATCH  | `/api/issues/:id/status`    | Update issue status            | Yes (Staff+)  |
| GET    | `/api/community/posts`      | List community posts           | Yes           |
| POST   | `/api/community/posts`      | Create community post          | Yes           |
| GET    | `/api/analytics/dashboard`  | Get dashboard analytics        | Yes (Admin)   |
| GET    | `/api/notifications`        | Get user notifications         | Yes           |

---

## 🤝 Contributing

1. **Read the docs** — Start with [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) and [`docs/TASK_TRACKER.md`](docs/TASK_TRACKER.md)
2. **Pick a task** — Find unfinished items in the Task Tracker
3. **Create a branch** — `git checkout -b feature/your-feature-name`
4. **Follow conventions** — See coding patterns in existing modules
5. **Write tests** — Add tests for new features
6. **Submit a PR** — With clear description of changes

### Coding Conventions

- **Backend**: Modular architecture — `controller → service → repository` per module
- **Frontend**: Next.js App Router with `page.tsx` per route, shared components in `components/`
- **Naming**: `camelCase` for variables/functions, `PascalCase` for components/classes
- **Validation**: Zod schemas for all API input validation

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for better civic governance**

[Report Bug](../../issues) · [Request Feature](../../issues) · [Documentation](docs/)

</div>
]]>
