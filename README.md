# TaskFlow

A full-stack project and task management app with JWT authentication and role-based access control (RBAC).

- **[backend/](./backend)** — REST API built with NestJS, TypeScript, PostgreSQL, and TypeORM
- **[frontend/](./frontend)** — React + TypeScript client with a kanban-style task board

See each folder's README for full setup details and architecture notes.

## Quick Start

**1. Backend** (runs on `http://localhost:3000`)
```bash
cd backend
npm install
cp .env.example .env   # fill in your DB credentials and JWT secrets
npm run migration:run
npm run start:dev
```

**2. Frontend** (runs on `http://localhost:5173`)
```bash
cd frontend
npm install
cp .env.example .env   # points to http://localhost:3000 by default
npm run dev
```

Sign up a new account at `http://localhost:5173/signup`, then start creating projects and tasks.

## Why this project

Built to demonstrate practical full-stack skills: authentication flows, authorization/RBAC design, relational data modeling, and a clean UI on top of a production-minded API (migrations instead of auto-sync, centralized error/response handling).