# NotifyX

A full-stack notification scheduling and delivery platform built with NestJS, Next.js, PostgreSQL, Prisma, Redis, and BullMQ.

NotifyX allows users to create notifications, schedule them for future delivery, track delivery status, and receive real-time status updates. The system also includes secure authentication, role-based authorization, audit logging, and Gmail-based email delivery.

## Live Demo

**Live application:** https://notifyx-web.onrender.com/

> For local development, PostgreSQL and Redis run through Docker while the API and web app can be run with pnpm.

## Features

- User registration and email verification
- JWT-based authentication and protected API routes
- bcrypt password hashing
- Password change and password recovery workflows
- Role-based authorization with `USER` and `ADMIN` roles
- Create, update, delete, schedule, and track notifications
- Delayed/background notification processing with BullMQ and Redis
- Retry handling for queued notification jobs
- Email delivery through Google Gmail API with OAuth 2.0
- Real-time notification status updates using Socket.IO
- Notification audit logs with snapshots and previous state
- Search, filtering, pagination, and notification status statistics
- Docker-based local and production deployment support

## Architecture

```text
                         ┌──────────────────────┐
                         │      Next.js Web      │
                         │   Dashboard / Auth    │
                         └──────────┬───────────┘
                                    │ REST + Socket.IO
                                    ▼
                         ┌──────────────────────┐
                         │      NestJS API       │
                         │ Auth / Notifications  │
                         │ Users / Audit / Queue │
                         └───────┬───────┬───────┘
                                 │       │
                    ┌────────────┘       └─────────────┐
                    ▼                                  ▼
          ┌──────────────────┐               ┌──────────────────┐
          │   PostgreSQL     │               │ Redis / BullMQ   │
          │  Prisma ORM      │               │ Async Processing │
          └──────────────────┘               └────────┬─────────┘
                                                       │
                                                       ▼
                                             ┌──────────────────┐
                                             │ Gmail API        │
                                             │ OAuth 2.0 Email  │
                                             └──────────────────┘
```

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Socket.IO client

### Backend
- NestJS
- TypeScript
- REST APIs
- Socket.IO
- Swagger

### Data & Background Processing
- PostgreSQL
- Prisma
- Redis
- BullMQ

### Authentication & Security
- JWT
- bcrypt
- Role-based authorization
- Email verification
- Password reset

### Email
- Google Gmail API
- OAuth 2.0

### Infrastructure
- Docker / Docker Compose
- Render
- Neon PostgreSQL
- Redis

## Authentication Flow

```text
Register
   │
   ▼
Password hashed with bcrypt
   │
   ▼
Verification email sent through Gmail API
   │
   ▼
Email verified
   │
   ▼
Login
   │
   ▼
JWT issued
   │
   ▼
Protected API access
```

Password recovery follows a token-based reset flow with expiration.

## Notification Processing

Notifications are not tied to the lifetime of an HTTP request.

```text
Create / Schedule Notification
            │
            ▼
       NestJS API
            │
            ▼
        BullMQ Queue
            │
            ▼
      Redis-backed Job
            │
            ▼
 Notification Processor
            │
            ▼
        Gmail API
            │
            ▼
  Notification status updated
            │
            ├──────────────► PostgreSQL
            │
            └──────────────► Socket.IO
                                  │
                                  ▼
                            Live Dashboard
```

Scheduled notifications are placed into the queue for delayed execution. Background processing handles delivery and retry attempts independently of the original API request.

## Audit Logging

NotifyX maintains audit records for notification lifecycle changes.

Audit entries can include:

- Action performed
- Entity and entity ID
- Description
- Previous snapshot
- Current snapshot
- Timestamp
- User who performed the action

This provides traceability for notification changes instead of retaining only the latest state.

## Role-Based Authorization

### USER
- Manage their own notification workflows
- View their notification history and status
- Use authentication and account-management features

### ADMIN
- All normal authenticated capabilities
- Access protected administrative user-management APIs

Admin authorization is enforced at the backend using JWT authentication and role guards. Public registration always creates a normal user account.

## Local Development

### Prerequisites

- Node.js
- pnpm
- Docker Desktop

### 1. Clone the repository

```bash
git clone https://github.com/harshalyuvraj/notifyx.git
cd notifyx
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create:

```text
apps/api/.env
```

Use:

```text
apps/api/.env.example
```

as the reference.

The local environment uses Docker-published services:

```env
DATABASE_URL="postgresql://notifyx:notifyx@localhost:5432/notifyx"
REDIS_URL="redis://localhost:6379"
```

Do not commit real secrets, refresh tokens, or other credentials.

### 4. Start PostgreSQL and Redis

From the repository root:

```bash
docker compose up -d postgres redis
```

Check:

```bash
docker compose ps
```

### 5. Start the backend

In a new terminal:

```bash
pnpm --filter api run start:dev
```

Backend:

```text
http://localhost:3001
```

Swagger:

```text
http://localhost:3001/api
```

### 6. Start the frontend

In another terminal:

```bash
pnpm --filter web run dev
```

Frontend:

```text
http://localhost:3000
```

## Docker Development

To run the complete application through Docker:

```bash
docker compose up -d --build
```

This starts:

- PostgreSQL
- Redis
- NestJS API
- Next.js web application

The Docker API uses:

```text
apps/api/.env.docker
```

so containers communicate using Docker service names such as `postgres` and `redis`.

## Database

The project uses Prisma migrations.

Schema:

```text
apps/api/prisma/schema.prisma
```

Migrations:

```text
apps/api/prisma/migrations/
```

Prisma Studio:

```bash
pnpm --filter api exec prisma studio
```

## API Documentation

When the backend is running locally, Swagger documentation is available at:

```text
http://localhost:3001/api
```

The API includes endpoints for:

- Authentication
- User management
- Notifications
- Audit history

Protected endpoints require a valid JWT, and admin-only endpoints additionally require the `ADMIN` role.

## Project Structure

```text
notifyx/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   └── src/
│   │       ├── auth/
│   │       ├── audit/
│   │       ├── email/
│   │       ├── gateway/
│   │       ├── notifications/
│   │       ├── prisma/
│   │       ├── queue/
│   │       └── users/
│   │
│   └── web/
│       ├── app/
│       │   ├── dashboard/
│       │   ├── login/
│       │   ├── register/
│       │   ├── forgot-password/
│       │   ├── reset-password/
│       │   ├── verify-email/
│       │   └── change-password/
│       └── lib/
│
├── infrastructure/
│   └── docker/
│       ├── api.Dockerfile
│       └── web.Dockerfile
│
├── docker-compose.yml
├── pnpm-workspace.yaml
└── README.md
```

## Production

The application is deployed using containerized services and managed cloud infrastructure.

The production setup uses:

- Render for application hosting
- Neon PostgreSQL
- Redis
- Google Gmail API with OAuth 2.0

Production secrets are configured through the deployment platform rather than committed to the repository.

## Security Notes

- Passwords are hashed with bcrypt before persistence.
- Authentication uses signed JWTs.
- Administrative routes are protected by role-based authorization.
- Email verification and password-reset tokens are stored as hashes with expiration.
- Secrets and OAuth credentials should be supplied through environment variables.
- Real access tokens should never be committed to `requests.http` or other repository files.

## Author

**Harshal Yuvraj**

GitHub: https://github.com/harshalyuvraj
