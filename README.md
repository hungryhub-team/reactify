<p align="center">
  <img src="https://img.shields.io/badge/Bun-1.2-f9f1e1?logo=bun&logoColor=000" alt="Bun" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=000" alt="React" />
  <img src="https://img.shields.io/badge/Hono-4-e36002?logo=hono&logoColor=fff" alt="Hono" />
  <img src="https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma&logoColor=fff" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=fff" alt="Tailwind" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

# Reactify

A production-ready, fullstack monolith boilerplate for building **Admin Panels** and **internal tools** with **React 19** and **Bun**. Ship modern web apps fast with a batteries-included stack — authentication, role-based access control, CRUD operations, database, API layer, and a beautiful dashboard UI — all wired together in a single monorepo.

> **Built for Admin Panels** — Reactify comes with a pre-configured dashboard layout, sidebar navigation, user management, task management, and auth guards. Clone it, customize it, and have your admin panel running in minutes.

## Why Reactify?

Starting a new fullstack project shouldn't mean spending days gluing together dozens of libraries. Reactify gives you a **complete, opinionated foundation** so you can focus on building your product instead of your infrastructure.

- **Admin-ready** — dashboard layout, sidebar, user/task CRUD, and role-based access out of the box
- **One command to start** — `bun run dev` spins up both client and server
- **Type-safe from database to UI** — shared types across the entire stack
- **Auth out of the box** — email/password + Google OAuth, ready to go
- **Blazing fast runtime** — powered by Bun, which [benchmarks significantly faster](https://www.youtube.com/watch?v=ECnlX00YcPI) than Node.js for HTTP serving, file I/O, and package installation

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | [Bun](https://bun.sh) |
| **Frontend** | [React 19](https://react.dev) + [Vite](https://vite.dev) |
| **Routing** | [TanStack Router](https://tanstack.com/router) (file-based, auto code-splitting) |
| **State / Data** | [TanStack Query](https://tanstack.com/query) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| **Backend** | [Hono](https://hono.dev) |
| **ORM** | [Prisma 7](https://www.prisma.io) (PostgreSQL) |
| **Auth** | [Better Auth](https://www.better-auth.com) (email/password + Google OAuth) |
| **Validation** | [Zod 4](https://zod.dev) |
| **Monorepo** | [Turborepo](https://turbo.build) + Bun Workspaces |
| **Linting** | [Biome](https://biomejs.dev) |

## Project Structure

```
reactify/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   └── features/    # Feature-specific components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities, API clients, auth
│   │   └── routes/          # File-based routes (TanStack Router)
│   └── vite.config.ts
│
├── server/                  # Hono backend (Bun)
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Migration history
│   ├── generated/prisma/    # Generated Prisma client
│   └── src/
│       ├── auth.ts          # Better Auth configuration
│       ├── db.ts            # Database connection (pg + Prisma)
│       ├── seed.ts          # Database seeder
│       └── http/
│           ├── handler/     # Route handlers (task, user)
│           └── middleware/   # Auth middleware
│
├── shared/                  # Shared types & validation schemas
│   └── src/types/           # Zod schemas + TypeScript types
│
├── turbo.json               # Turborepo pipeline config
├── biome.json               # Linter & formatter config
└── package.json             # Root workspace config
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.2+
- [PostgreSQL](https://www.postgresql.org) (local or hosted)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/reactify.git
cd reactify
bun install
```

### 2. Configure Environment

Create a `.env` file inside the `server/` directory:

```env
# Database
DATABASE_URL=postgres://root:rootroot@localhost:5432/reactify_example_db

# Auth
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-super-secret-key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Client URL
CLIENT_URL=http://localhost:5173
```

Create a `.env` file inside the `client/` directory (optional):

```env
VITE_SERVER_URL=http://localhost:3000
```

### 3. Set Up the Database

```bash
# Generate Prisma client
cd server
bunx prisma migrate dev

# Seed initial data (optional)
bun run seed
```

### 4. Run Development Servers

```bash
# From the root directory — starts both client & server
bun run dev
```

| Service | URL |
|---|---|
| Frontend (Vite) | [http://localhost:5173](http://localhost:5173) |
| Backend (Hono) | [http://localhost:3000](http://localhost:3000) |

## Available Scripts

Run these from the **root** directory:

| Command | Description |
|---|---|
| `bun run dev` | Start all services in development mode |
| `bun run dev:client` | Start only the frontend |
| `bun run dev:server` | Start only the backend |
| `bun run build` | Build all packages for production |
| `bun run lint` | Lint the entire codebase with Biome |
| `bun run format` | Auto-format code with Biome |
| `bun run type-check` | Run TypeScript type checking |
| `bun run test` | Run all tests |

## Architecture Overview

### Shared Types

The `shared/` package acts as the **single source of truth** for types and validation schemas. Both server and client import from it, ensuring end-to-end type safety:

```typescript
// shared/src/types/task/index.ts
import { z } from "zod";

export const taskCreateSchema = z.object({ ... });
export type TaskCreate = z.infer<typeof taskCreateSchema>;
```

### API Layer

The server follows a **handler → usecase → database** pattern:

1. **Handlers** (`server/src/http/handler/`) — parse requests, validate input, return responses
2. **Usecases** (`server/src/usecase/`) — business logic, error handling, result types
3. **Database** (`server/src/db.ts`) — Prisma client with PostgreSQL via `pg` adapter

### Authentication

Powered by [Better Auth](https://www.better-auth.com), supporting:

- Email/password sign-in
- Google OAuth
- Session management with secure cookies
- Role-based access control
- Auth middleware for protected API routes

### Frontend

- **File-based routing** via TanStack Router with automatic code splitting
- **Data fetching** via TanStack Query with 30s stale time
- **UI components** from shadcn/ui (Radix Nova style) with Tailwind CSS v4
- **Form handling** via React Hook Form + Zod validation
- **Toast notifications** via Sonner

## Adding New Features

### 1. Define shared types

```bash
# shared/src/types/your-feature/index.ts
```

### 2. Create the Prisma model

```bash
# server/prisma/schema.prisma → add your model
cd server && bunx prisma migrate dev --name add_your_feature
```

### 3. Add server handler + usecase

```bash
# server/src/usecase/your_feature_usecase.ts
# server/src/http/handler/your_feature_handler.ts
```

### 4. Mount the route

```typescript
// server/src/index.ts
import yourFeature from "./http/handler/your_feature_handler";
app.route("/api/your-feature", yourFeature);
```

### 5. Build the frontend

```bash
# client/src/routes/your-feature/index.tsx  → auto-registered by TanStack Router
# client/src/lib/your-feature-api.ts        → API client with TanStack Query
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
