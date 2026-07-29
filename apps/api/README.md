# 🚀 NotifyX

# 🚀 NotifyX

![NestJS](https://img.shields.io/badge/NestJS-v11-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![Redis](https://img.shields.io/badge/Redis-Queue-red)
![BullMQ](https://img.shields.io/badge/BullMQ-Background%20Jobs-green)

A scalable notification backend built with **NestJS**, **Prisma**, **PostgreSQL**, **Redis**, **BullMQ**, and **Nodemailer**.

NotifyX provides secure user authentication, notification management, asynchronous background processing, scheduled email delivery, and interactive API documentation.

---

## ✨ Features

- 🔐 JWT Authentication
- 👤 User Registration & Login
- 📧 Email Notifications
- ⏰ Scheduled Notifications
- ⚡ Background Job Processing using BullMQ
- 🗄 PostgreSQL Database
- 🔄 Prisma ORM
- 📄 Swagger API Documentation
- 🐳 Dockerized PostgreSQL & Redis
- ✅ DTO Validation using class-validator

---

## 🛠 Tech Stack

| Technology | Purpose                   |
| ---------- | ------------------------- |
| NestJS     | Backend Framework         |
| TypeScript | Programming Language      |
| PostgreSQL | Database                  |
| Prisma     | ORM                       |
| Redis      | Queue Backend             |
| BullMQ     | Background Job Processing |
| Nodemailer | Email Service             |
| JWT        | Authentication            |
| Swagger    | API Documentation         |
| Docker     | Containerization          |

---

## 🏗 Architecture

```

                 Client
                    │
                    ▼
            NestJS REST API
                    │
        ┌───────────┴────────────┐
        ▼                        ▼
 PostgreSQL                 BullMQ Queue
    Prisma                     Redis
        ▲                        │
        │                        ▼
        └──────── Worker ─────────┘
                    │
                    ▼
               Gmail SMTP
                    │
                    ▼
                User Inbox

```

---

## 📂 Project Structure

```

apps/
└── api/
├── prisma/
├── src/
│ ├── auth/
│ ├── email/
│ ├── notifications/
│ ├── prisma/
│ ├── queue/
│ └── users/

```

---

## ⚙️ Environment Variables

Create a `.env` file inside `apps/api`.

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/notifyx

JWT_SECRET=your-secret-key

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 🚀 Installation

Clone the repository

```bash
git clone https://github.com/harshalyuvraj/notifyx.git
```

```bash
cd notifyx
```

Install dependencies

```bash
pnpm install
```

---

## 🐳 Start PostgreSQL

```bash
docker run -d \
--name notifyx-postgres \
-p 5432:5432 \
-e POSTGRES_PASSWORD=password \
postgres:16
```

---

## 🐳 Start Redis

```bash
docker run -d \
--name notifyx-redis \
-p 6379:6379 \
redis:7
```

---

## 🗄 Database Migration

```bash
pnpm --filter api prisma migrate dev
```

---

## ▶️ Run the Application

```bash
pnpm --filter api start:dev
```

---

## 📖 Swagger Documentation

```
http://localhost:3000/api
```

---

## 🔑 Authentication Flow

1. Register a user

```
POST /auth/register
```

2. Login

```
POST /auth/login
```

3. Copy the JWT token

4. Click **Authorize** in Swagger

5. Paste

```
Bearer <your_token>
```

6. Access protected endpoints

---

## 📬 Notification Flow

1. User creates notification

2. Notification saved in PostgreSQL

3. BullMQ creates background job

4. Redis stores the job

5. Worker processes the job

6. Email sent via Gmail SMTP

7. Notification marked as SENT

---

## 📌 API Endpoints

### Authentication

```
POST /auth/register
POST /auth/login
GET  /auth/profile
```

### Users

```
POST   /users
GET    /users
GET    /users/:id
PATCH  /users/:id
DELETE /users/:id
```

### Notifications

```
POST   /notifications
GET    /notifications
GET    /notifications/:id
PATCH  /notifications/:id
DELETE /notifications/:id
```

---

## 📸 Screenshots

- Swagger UI
- Successful email delivery
- BullMQ processing logs

---

## 🔮 Future Improvements

- SMS Notifications
- Push Notifications
- Retry Policies
- Failed Job Handling
- Bull Board Dashboard
- Docker Compose
- CI/CD Pipeline
- Kubernetes Deployment

---

## 👨‍💻 Author

Harshal Yuvraj

GitHub:

https://github.com/harshalyuvraj
