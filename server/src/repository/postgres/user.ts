import { db } from "../../db";
import { users, sessions, accounts } from "../../db/schema";
import { eq, or, ilike, count as drizzleCount, sql } from "drizzle-orm";
import {
  type RepositoryResult,
  type PaginationParams,
  type PaginatedData,
  createError,
  success,
  failure,
} from "../types";

// ---------------------
// Types
// ---------------------

export type UserEntity = typeof users.$inferSelect;
export type UserCreateInput = typeof users.$inferInsert;
export type UserUpdateInput = Partial<UserCreateInput>;

export type UserSearchParams = {
  q?: string;
  role?: number;
} & PaginationParams;

export type UserWithRelations = UserEntity & {
  sessions?: Array<{
    id: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
  }>;
  accounts?: Array<{
    id: string;
    providerId: string;
    accountId: string;
  }>;
};

// ---------------------
// Repository
// ---------------------

export class UserRepository {
  /**
   * Find user by ID
   */
  async findById(id: string, includeRelations = false): Promise<RepositoryResult<UserEntity | UserWithRelations | null>> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, id),
        with: includeRelations ? {
          sessions: {
            columns: {
              id: true,
              token: true,
              expiresAt: true,
              createdAt: true,
            }
          },
          accounts: {
            columns: {
              id: true,
              providerId: true,
              accountId: true,
            }
          }
        } : undefined,
      });
      return success(user ?? null);
    } catch (error) {
      console.error("[UserRepository] findById error:", error);
      return failure(createError("Failed to find user by ID", "DB_ERROR", error));
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<RepositoryResult<UserEntity | null>> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
      return success(user ?? null);
    } catch (error) {
      console.error("[UserRepository] findByEmail error:", error);
      return failure(createError("Failed to find user by email", "DB_ERROR", error));
    }
  }

  /**
   * Find all users with optional search and pagination
   */
  async findMany(params: UserSearchParams): Promise<RepositoryResult<PaginatedData<UserEntity>>> {
    try {
      const { q, role, page, limit } = params;
      const skip = (page - 1) * limit;

      let conditionsList = [];
      if (q) {
        conditionsList.push(
          or(
            ilike(users.name, `%${q}%`),
            ilike(users.email, `%${q}%`)
          )
        );
      }
      if (role !== undefined && role !== null) {
        conditionsList.push(eq(users.role, role));
      }

      const conditions = conditionsList.length > 0 ? sql.join(conditionsList, sql` AND `) : undefined;

      const [items, totalResult] = await Promise.all([
        db.select()
          .from(users)
          .where(conditions)
          .orderBy(sql`${users.createdAt} DESC`)
          .limit(limit)
          .offset(skip),
        db.select({ count: drizzleCount() }).from(users).where(conditions),
      ]);

      const total = totalResult[0]?.count ?? 0;
      const totalPages = Math.ceil(total / limit);

      return success({
        items,
        total,
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      console.error("[UserRepository] findMany error:", error);
      return failure(createError("Failed to find users", "DB_ERROR", error));
    }
  }

  /**
   * Create a new user
   */
  async create(input: UserCreateInput): Promise<RepositoryResult<UserEntity>> {
    try {
      const result = await db.insert(users).values({
        ...input,
        id: input.id ?? crypto.randomUUID(), // Assume cuid/uuid replacement
        role: input.role ?? 2, // Default to USER role
      }).returning();
      return success(result[0]!);
    } catch (error) {
      console.error("[UserRepository] create error:", error);
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === "23505") {
        return failure(createError("Email already exists", "DUPLICATE_EMAIL", error));
      }
      return failure(createError("Failed to create user", "DB_ERROR", error));
    }
  }

  /**
   * Update an existing user
   */
  async update(id: string, input: UserUpdateInput): Promise<RepositoryResult<UserEntity>> {
    try {
      const result = await db.update(users).set({
        ...input,
        updatedAt: new Date(),
      }).where(eq(users.id, id)).returning();

      if (result.length === 0) return failure(createError("User not found", "NOT_FOUND", null));
      return success(result[0]!);
    } catch (error) {
      console.error("[UserRepository] update error:", error);
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === "23505") {
        return failure(createError("Email already exists", "DUPLICATE_EMAIL", error));
      }
      return failure(createError("Failed to update user", "DB_ERROR", error));
    }
  }

  /**
   * Delete a user (cascades to sessions and accounts)
   */
  async delete(id: string): Promise<RepositoryResult<UserEntity>> {
    try {
      const result = await db.delete(users).where(eq(users.id, id)).returning();
      if (result.length === 0) return failure(createError("User not found", "NOT_FOUND", null));
      return success(result[0]!);
    } catch (error) {
      console.error("[UserRepository] delete error:", error);
      return failure(createError("Failed to delete user", "DB_ERROR", error));
    }
  }

  /**
   * Count total users
   */
  async count(): Promise<RepositoryResult<number>> {
    try {
      const result = await db.select({ value: drizzleCount() }).from(users);
      return success(result[0]?.value ?? 0);
    } catch (error) {
      console.error("[UserRepository] count error:", error);
      return failure(createError("Failed to count users", "DB_ERROR", error));
    }
  }

  /**
   * Check if user exists by ID
   */
  async exists(id: string): Promise<RepositoryResult<boolean>> {
    try {
      const result = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
      return success(result.length > 0);
    } catch (error) {
      console.error("[UserRepository] exists error:", error);
      return failure(createError("Failed to check user existence", "DB_ERROR", error));
    }
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<RepositoryResult<boolean>> {
    try {
      const result = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
      return success(result.length > 0);
    } catch (error) {
      console.error("[UserRepository] emailExists error:", error);
      return failure(createError("Failed to check email existence", "DB_ERROR", error));
    }
  }

  /**
   * Find users by role
   */
  async findByRole(role: number, params?: PaginationParams): Promise<RepositoryResult<PaginatedData<UserEntity>>> {
    try {
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
      const skip = (page - 1) * limit;

      const [items, totalResult] = await Promise.all([
        db.select()
          .from(users)
          .where(eq(users.role, role))
          .orderBy(sql`${users.createdAt} DESC`)
          .limit(limit)
          .offset(skip),
        db.select({ count: drizzleCount() }).from(users).where(eq(users.role, role)),
      ]);

      const total = totalResult[0]?.count ?? 0;
      const totalPages = Math.ceil(total / limit);

      return success({
        items,
        total,
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      console.error("[UserRepository] findByRole error:", error);
      return failure(createError("Failed to find users by role", "DB_ERROR", error));
    }
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
