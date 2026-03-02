# GitHub Copilot Instructions & Guidelines

These guidelines are intended to help GitHub Copilot generate code that is consistent with the project's architecture, style, and best practices.

## 1. Project Overview
- **Type:** Monorepo (Turborepo) - Full Stack Monolith
- **Structure:**
  - `client/`: Frontend application (React).
  - `server/`: Backend API (Hono/Node).
  - `shared/`: Shared library containing TypeScript types, Zod schemas, and utilities shared between `client` and `server` for end-to-end type safety.
- **Package Manager:** Bun
- **Languages:** TypeScript, TSX
- **Formatting:** Biome (replaces Prettier/ESLint)

## 2. Tech Stack

### Client (`/client`)
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4 + Shadcn UI
- **Routing:** TanStack Router (`@tanstack/react-router`)
- **State Management/Data Fetching:** TanStack Query (`@tanstack/react-query`)
- **Forms:** React Hook Form + Zod (`@hookform/resolvers`)
- **Icons:** Lucide React, HugeIcons
- **Auth:** Better Auth Client

### Server (`/server`)
- **Runtime:** Bun
- **Framework:** Hono
- **Database:** PostgreSQL (via Prisma ORM)
- **Auth:** Better Auth Server
- **Validation:** Zod

### Shared (`/shared`)
- Shared TypeScript types and utility functions specific to this domain.

## 3. Architecture & Project Structure

### Client (`client/src/`)
```
client/src/
├── App.tsx                          # Root app component
├── main.tsx                         # Entry point
├── index.css                        # Global styles (Tailwind)
├── routeTree.gen.ts                 # Auto-generated route tree
├── components/
│   ├── ui/                          # Reusable UI primitives (Shadcn)
│   │   ├── alert-dialog.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── combobox.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── field.tsx
│   │   ├── input-group.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── progress.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   └── tooltip.tsx
│   └── features/                    # Feature-specific components
│       ├── dashboard/
│       │   ├── activity-feed.tsx
│       │   ├── dashboard-layout.tsx
│       │   ├── plan-distribution.tsx
│       │   ├── revenue-chart.tsx
│       │   └── stat-card.tsx
│       ├── examples/
│       │   ├── component-example.tsx
│       │   └── example.tsx
│       ├── restaurants/
│       │   └── restaurant-table.tsx
│       ├── tasks/
│       │   ├── task-delete-dialog.tsx
│       │   └── task-form-dialog.tsx
│       └── users/
│           ├── user-delete-dialog.tsx
│           └── user-form-dialog.tsx
├── lib/                             # Utilities, API functions, data
│   ├── auth-client.ts
│   ├── data.ts
│   ├── task-api.ts
│   ├── user-api.ts
│   └── utils.ts
└── routes/                          # File-based routing (TanStack Router)
    ├── __root.tsx                   # Root layout
    ├── index.tsx                    # Landing page
    ├── login.tsx
    ├── dashboard.tsx                # Dashboard layout route
    └── dashboard/
        ├── index.tsx                # Dashboard home
        ├── example-crud/
        │   └── index.tsx
        ├── restaurants/
        │   ├── index.tsx
        │   └── $restaurantId.tsx
        ├── tasks/
        │   └── index.tsx
        └── users/
            └── index.tsx
```

- **Components:**
  - `components/ui/`: Dumb, reusable UI components (mostly Shadcn).
  - `components/features/<feature>/`: Feature-specific components grouped by domain.
- **Routes:**
  - File-based routing in `routes/` (TanStack Router style).
  - Use `__root.tsx` for layout.
  - Directories represent route segments (e.g., `dashboard/index.tsx`, `dashboard/tasks/index.tsx`).
- **Data Fetching:**
  - Use custom hooks wrapping `useQuery` or `useMutation`.
  - API functions reside in `lib/`.

### Server (`server/src/`)
```
server/src/
├── index.ts                         # Entry point (starts Hono server)
├── auth.ts                          # Better Auth config
├── db.ts                            # Prisma client instance
├── migrate.ts                       # Migration script
├── seed.ts                          # Seed script
├── http/
│   ├── index.ts                     # HTTP route aggregation
│   └── handler/                     # Transport layer (Hono handlers)
│       ├── task_handler.ts
│       └── user_handler.ts
└── usecase/                         # Business logic layer
    ├── task_usecase.ts              # Simple usecase (single file)
    ├── user_usecase.ts
    └── order/                       # Complex usecase (folder)
        ├── create_usecase.ts
        ├── cancel_usecase.ts
        └── fulfill_usecase.ts
```

- **Architecture Pattern:** Layered Architecture (Handler -> Usecase -> DB)
  - **Transport Layer (`http/handler/`):**
    - Handles HTTP details (Hono Context `c`).
    - Validates inputs using Zod (often shared schemas).
    - Calls the Usecase layer.
    - Formats the HTTP response.
  - **Business Logic Layer (`usecase/`):**
    - Contains core business rules.
    - Framework-agnostic (doesn't know about HTTP/Hono).
    - Interacting with the Database via Prisma.
    - **Simple domains:** Use a single file (e.g., `task_usecase.ts`).
    - **Complex domains:** Organize into a folder with separate files per operation (e.g., `usecase/order/create_usecase.ts`, `usecase/order/cancel_usecase.ts`). Use this approach when a single usecase file becomes too large or the domain has many distinct operations.
  - **Data Access:**
    - Direct usage of `prisma` client within Usecases (or separate repository layer if complexity grows).
- **API Routes:**
  - Define routes in Hono.
  - Use strictly typed request/response bodies.

### Shared (`shared/src/`)
```
shared/src/
├── index.ts                         # Re-exports all shared modules
└── types/
    ├── index.ts                     # Re-exports all types
    ├── common.ts                    # Common/shared types & schemas
    ├── task/
    │   └── index.ts                 # Task types & Zod schemas
    └── user/
        └── index.ts                 # User types & Zod schemas
```

- Shared TypeScript types, Zod schemas, and constants used by both `client` and `server`.
- Import via `import { ... } from "shared"` in workspace packages.

## 4. Coding Standards

### General
- **Naming Conventions:**
  - Files: `kebab-case` (e.g., `task-form.tsx`, `user-controller.ts`).
  - Directories: `kebab-case`.
  - Variables/Functions: `camelCase`.
  - React Components: `PascalCase`.
  - Interfaces/Types: `PascalCase`.
- **Imports:**
  - Use absolute imports or workspace aliases where configured.
  - Group imports: Built-in -> External -> Internal.
- **Async/Await:** Prefer `async/await` over raw Promises.

### TypeScript
- **Strict Mode:** Enabled.
- **Types:**
  - Explicitly type function arguments and return values where inference isn't obvious.
  - Share types between Client and Server using the `shared` workspace package.
  - Avoid `any`. Use `unknown` or specific types.

### React (Client)
- **Functional Components:** Use function declarations/expressions.
- **Hooks:** Ensure hooks are called at the top level.
- **Tailwind:**
  - Use utility classes for styling.
  - Use `clsx` or `cn` helper for conditional classes.
  - Avoid inline `style` objects.
- **TanStack Router:**
  - Use `Link` component for navigation.
  - Use `useLoaderData` or `useSearch` for route data/params.

### Hono (Server)
- **Context:** Use typed Context (`c`) for improved type safety.
- **Validation:** Use Zod Validator middleware.
- **Error Handling:**
  - Return standardized error responses (JSON).
  - Use standard HTTP status codes.

## 5. Development Workflow
- **Migrations:**
  - Run `bun run migrate` (or equivalent Prisma command) when Schema changes.
- **Running:**
  - `bun run dev` in root starts both Client and Server (via Turbo).

## 6. Examples (Copilot Context)

**Good Client Component:**
```tsx
import { useQuery } from "@tanstack/react-query";
import { getTasks } from "@/lib/api";
import { TaskCard } from "./task-card";

export function TaskList() {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid gap-4">
      {tasks?.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
```

**Good Server Handler:**
```ts
import { Hono } from "hono";
import { taskUsecase } from "../../usecase/task_usecase";

const app = new Hono();

app.get("/", async (c) => {
  const tasks = await taskUsecase.getTasks();
  return c.json({ data: tasks });
});

export default app;
```
