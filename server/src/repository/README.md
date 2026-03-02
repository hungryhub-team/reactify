# Repository Pattern Implementation

This directory contains the repository layer that abstracts database operations from the business logic.

## Structure

```
repository/
├── types.ts                    # Base repository types and utilities
├── index.ts                    # Main export file
└── postgres/                   # PostgreSQL specific repositories
    ├── index.ts                # Export all postgres repositories
    ├── task.ts                 # Task entity repository
    ├── user.ts                 # User entity repository
    ├── session.ts              # Session entity repository
    ├── account.ts              # Account entity repository
    └── verification.ts         # Verification entity repository
```

## Design Principles

1. **Single Responsibility**: Each repository handles one database table/entity
2. **Consistent Interface**: All repositories follow the same pattern
3. **Error Handling**: Standardized error responses using `RepositoryResult<T>`
4. **Type Safety**: Full TypeScript support with proper type definitions
5. **Separation of Concerns**: Database logic is isolated from business logic

## Usage Examples

### 1. Task Repository

```typescript
import { taskRepository } from "./repository/postgres";

// Create a task
const result = await taskRepository.create({
  title: "Complete project",
  description: "Finish the repository implementation",
  date: new Date(),
});

if (result.success) {
  console.log("Created task:", result.data);
} else {
  console.error("Error:", result.error.message);
}

// Find tasks with pagination and search
const tasksResult = await taskRepository.findMany({
  q: "project",
  page: 1,
  limit: 10,
});

if (tasksResult.success) {
  console.log("Tasks:", tasksResult.data.items);
  console.log("Total:", tasksResult.data.total);
}

// Update a task
const updateResult = await taskRepository.update(1, {
  title: "Updated title",
});

// Delete a task
const deleteResult = await taskRepository.delete(1);
```

### 2. User Repository

```typescript
import { userRepository } from "./repository/postgres";

// Create a user
const result = await userRepository.create({
  email: "user@example.com",
  name: "John Doe",
  role: 2,
});

// Find user by email
const userResult = await userRepository.findByEmail("user@example.com");

// Find users by role
const adminResult = await userRepository.findByRole(1, {
  page: 1,
  limit: 10,
});

// Check if email exists
const existsResult = await userRepository.emailExists("user@example.com");

if (existsResult.success && existsResult.data) {
  console.log("Email already exists");
}
```

### 3. Session Repository

```typescript
import { sessionRepository } from "./repository/postgres";

// Create a session
const result = await sessionRepository.create({
  token: "unique-token-123",
  userId: "user-id",
  expiresAt: new Date(Date.now() + 86400000), // 24 hours
  ipAddress: "127.0.0.1",
  userAgent: "Mozilla/5.0...",
});

// Find by token
const sessionResult = await sessionRepository.findByToken("unique-token-123", true);

// Check if session is valid
const isValidResult = await sessionRepository.isValid("unique-token-123");

// Delete expired sessions
const cleanupResult = await sessionRepository.deleteExpired();
console.log("Deleted", cleanupResult.data?.count, "expired sessions");
```

### 4. Account Repository

```typescript
import { accountRepository } from "./repository/postgres";

// Create an account
const result = await accountRepository.create({
  accountId: "google-123456",
  providerId: "google",
  userId: "user-id",
  accessToken: "token",
  scope: "email profile",
});

// Find by provider and account
const accountResult = await accountRepository.findByProviderAccount(
  "google",
  "google-123456"
);

// Find all accounts for a user
const userAccountsResult = await accountRepository.findByUserId("user-id");
```

### 5. Verification Repository

```typescript
import { verificationRepository } from "./repository/postgres";

// Create a verification
const result = await verificationRepository.create({
  identifier: "user@example.com",
  value: "verification-code-123",
  expiresAt: new Date(Date.now() + 3600000), // 1 hour
});

// Validate verification
const isValidResult = await verificationRepository.isValid(
  "user@example.com",
  "verification-code-123"
);

// Find latest valid verification
const latestResult = await verificationRepository.findLatestValid("user@example.com");

// Delete expired verifications
const cleanupResult = await verificationRepository.deleteExpired();
```

## Using in Use Cases

The repository pattern should be used in your use case layer:

```typescript
// usecase/task_usecase.ts
import { taskRepository } from "../repository/postgres";
import type { TaskCreate } from "shared";

async function createTask(input: TaskCreate) {
  // Convert input to repository format
  const result = await taskRepository.create({
    title: input.title,
    description: input.description,
    date: new Date(input.date),
  });

  if (!result.success) {
    return { ok: false, error: result.error };
  }

  // Convert repository entity to use case format
  const task = {
    id: result.data.id,
    title: result.data.title,
    description: result.data.description,
    date: result.data.date.toISOString(),
    createdAt: result.data.createdAt.toISOString(),
    updatedAt: result.data.updatedAt.toISOString(),
  };

  return { ok: true, data: task };
}
```

## Response Types

All repository methods return a `RepositoryResult<T>`:

```typescript
type RepositoryResult<T> =
  | { success: true; data: T }
  | { success: false; error: RepositoryError };

type RepositoryError = {
  message: string;
  code: string;
  originalError?: unknown;
};
```

## Paginated Results

Methods that return lists use `PaginatedData<T>`:

```typescript
type PaginatedData<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
```

## Error Codes

Common error codes:
- `DB_ERROR`: General database errors
- `DUPLICATE_EMAIL`: Email already exists (User)
- `DUPLICATE_TOKEN`: Token already exists (Session)

## Benefits

1. **Testability**: Easy to mock repositories in tests
2. **Maintainability**: Database logic is centralized
3. **Flexibility**: Easy to switch databases without changing business logic
4. **Type Safety**: Full TypeScript support
5. **Consistency**: All database operations follow the same pattern
6. **Error Handling**: Standardized error responses

## Adding New Repositories

To add a new repository:

1. Create a new file in `postgres/` directory (e.g., `new_entity.ts`)
2. Define entity types and input types
3. Implement the repository class with CRUD methods
4. Export a singleton instance
5. Add export to `postgres/index.ts`

Follow the existing patterns for consistency.
