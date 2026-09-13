# TaskFlow API

A REST API for managing projects and tasks, with JWT authentication and role-based access control (RBAC). Built with **NestJS**, **TypeScript**, **PostgreSQL**, and **TypeORM**.

Think of it as a lightweight backend for a Trello/Jira-style tool: users sign up, get assigned a role, and can create projects, add tasks, and assign work to teammates — all guarded by role-based permissions.

## Features

- **JWT authentication** — signup, login, and access/refresh token flow
- **Role-based access control** — `admin`, `manager`, and `member` roles enforced via guards and decorators
- **CRUD APIs** for Users, Projects, and Tasks with proper relations (User → Project → Task)
- **Request validation** with DTOs and `class-validator`
- **Database migrations** (no `synchronize: true`) using TypeORM
- **Interactive API docs** via Swagger/OpenAPI at `/api/docs`
- **Password hashing** with bcrypt, sensitive fields excluded from responses
- **Centralized response handling** — every success and error response is normalized into one consistent JSON envelope, application-wide

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | NestJS |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | TypeORM |
| Auth | JWT (Passport) |
| Docs | Swagger (OpenAPI) |
| Testing | Jest |

## Architecture

```
src/
├── auth/            # Signup, login, refresh, JWT strategy
├── users/           # User entity, admin-facing user management
├── projects/        # Project entity, CRUD, ownership rules
├── tasks/           # Task entity, CRUD, assignment
├── common/
│   ├── decorators/    # @Roles(), @CurrentUser()
│   ├── guards/        # JwtAuthGuard, RolesGuard
│   ├── filters/       # AllExceptionsFilter (centralized error responses)
│   ├── interceptors/  # TransformInterceptor (centralized success responses)
│   ├── interfaces/    # AuthUser
│   └── enums/         # Role, TaskStatus
├── database/
│   ├── data-source.ts     # TypeORM CLI data source
│   └── migrations/        # Schema migrations
├── app.module.ts
└── main.ts
```

**Data model:** a `User` owns many `Project`s; a `Project` has many `Task`s; a `Task` is optionally assigned to a `User`. Roles are enforced at the route level with `@Roles(...)` + `RolesGuard`, and project-level ownership is checked in the service layer (e.g. only an owner, manager, or admin can edit/delete a project).

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (or via Docker)

### Setup

```bash
git clone <your-repo-url>
cd taskflow-api
npm install
cp .env.example .env   # then fill in your DB credentials and JWT secrets
```

### Run migrations

```bash
npm run migration:run
```

### Start the server

```bash
npm run start:dev
```

The API runs on `http://localhost:3000`. Interactive Swagger docs are at `http://localhost:3000/api/docs`.

### Run tests

```bash
npm test
```

## API Overview

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Register a new user (default role: `member`) |
| POST | `/auth/login` | Log in, receive access + refresh tokens |
| POST | `/auth/refresh` | Exchange a refresh token for a new access token |

### Users (admin/manager only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | List all users |
| GET | `/users/:id` | Get a user |
| PATCH | `/users/:id/role` | Change a user's role (admin only) |
| DELETE | `/users/:id` | Delete a user (admin only) |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| POST | `/projects` | Create a project (any authenticated user) |
| GET | `/projects` | List all projects |
| GET | `/projects/:id` | Get a project with its tasks |
| PATCH | `/projects/:id` | Update (owner, manager, or admin) |
| DELETE | `/projects/:id` | Delete (owner, manager, or admin) |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| POST | `/tasks` | Create a task (admin/manager) |
| GET | `/tasks?projectId=&assigneeId=` | List/filter tasks |
| GET | `/tasks/:id` | Get a task |
| PATCH | `/tasks/:id` | Update a task (any authenticated user, e.g. to update status) |
| DELETE | `/tasks/:id` | Delete a task (admin/manager) |

All routes except `/auth/*` require a `Authorization: Bearer <accessToken>` header.

## Centralized Response Format

Rather than each controller shaping its own responses, a global filter and interceptor normalize every response application-wide.

**Success** (any 2xx response, via `TransformInterceptor`):
```json
{
  "success": true,
  "statusCode": 200,
  "path": "/projects",
  "timestamp": "2026-09-08T10:15:00.000Z",
  "data": [ ]
}
```

**Error** (any thrown exception, via `AllExceptionsFilter`):
```json
{
  "success": false,
  "statusCode": 404,
  "path": "/projects/123",
  "timestamp": "2026-09-08T10:15:00.000Z",
  "message": "Project 123 not found",
  "error": "Not Found"
}
```

This means API consumers can always branch on `success` without needing to know which endpoint they called.

## Why this project

This was built to demonstrate practical backend skills relevant to production Node.js roles: authentication flows, authorization design, relational data modeling, input validation, and migration-based schema management — rather than relying on ORM auto-sync or a toy in-memory data store.

## Possible Next Steps

- Dockerize the app + Postgres with `docker-compose`
- Add pagination to list endpoints
- Add e2e tests with a test database
- Rate limiting on `/auth/login`
