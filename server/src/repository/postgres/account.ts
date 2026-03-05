import { db } from "../../db";
import { accounts } from "../../db/schema";
import { eq, and, count as drizzleCount, sql } from "drizzle-orm";
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

export type AccountEntity = typeof accounts.$inferSelect;
export type AccountCreateInput = typeof accounts.$inferInsert;
export type AccountUpdateInput = Partial<AccountCreateInput>;

export type AccountWithUser = AccountEntity & {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: number;
  };
};

// ---------------------
// Repository
// ---------------------

export class AccountRepository {
  /**
   * Find account by ID
   */
  async findById(id: string, includeUser = false): Promise<RepositoryResult<AccountEntity | AccountWithUser | null>> {
    try {
      const account = await db.query.accounts.findFirst({
        where: eq(accounts.id, id),
        with: includeUser ? {
          user: {
            columns: {
              id: true,
              email: true,
              name: true,
              role: true,
            }
          }
        } : undefined,
      });
      return success(account ?? null);
    } catch (error) {
      console.error("[AccountRepository] findById error:", error);
      return failure(createError("Failed to find account by ID", "DB_ERROR", error));
    }
  }

  /**
   * Find account by provider and account ID
   */
  async findByProviderAccount(
    providerId: string,
    accountId: string,
    includeUser = false
  ): Promise<RepositoryResult<AccountEntity | AccountWithUser | null>> {
    try {
      const account = await db.query.accounts.findFirst({
        where: and(eq(accounts.providerId, providerId), eq(accounts.accountId, accountId)),
        with: includeUser ? {
          user: {
            columns: {
              id: true,
              email: true,
              name: true,
              role: true,
            }
          }
        } : undefined,
      });
      return success(account ?? null);
    } catch (error) {
      console.error("[AccountRepository] findByProviderAccount error:", error);
      return failure(createError("Failed to find account by provider", "DB_ERROR", error));
    }
  }

  /**
   * Find all accounts for a user
   */
  async findByUserId(userId: string, params?: PaginationParams): Promise<RepositoryResult<PaginatedData<AccountEntity>>> {
    try {
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
      const skip = (page - 1) * limit;

      const [items, totalResult] = await Promise.all([
        db.select()
          .from(accounts)
          .where(eq(accounts.userId, userId))
          .orderBy(sql`${accounts.createdAt} DESC`)
          .limit(limit)
          .offset(skip),
        db.select({ count: drizzleCount() }).from(accounts).where(eq(accounts.userId, userId)),
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
      console.error("[AccountRepository] findByUserId error:", error);
      return failure(createError("Failed to find accounts by user ID", "DB_ERROR", error));
    }
  }

  /**
   * Find accounts by provider
   */
  async findByProvider(providerId: string, params?: PaginationParams): Promise<RepositoryResult<PaginatedData<AccountEntity>>> {
    try {
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
      const skip = (page - 1) * limit;

      const [items, totalResult] = await Promise.all([
        db.select()
          .from(accounts)
          .where(eq(accounts.providerId, providerId))
          .orderBy(sql`${accounts.createdAt} DESC`)
          .limit(limit)
          .offset(skip),
        db.select({ count: drizzleCount() }).from(accounts).where(eq(accounts.providerId, providerId)),
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
      console.error("[AccountRepository] findByProvider error:", error);
      return failure(createError("Failed to find accounts by provider", "DB_ERROR", error));
    }
  }

  /**
   * Find all accounts with pagination
   */
  async findMany(params: PaginationParams): Promise<RepositoryResult<PaginatedData<AccountEntity>>> {
    try {
      const { page, limit } = params;
      const skip = (page - 1) * limit;

      const [items, totalResult] = await Promise.all([
        db.select()
          .from(accounts)
          .orderBy(sql`${accounts.createdAt} DESC`)
          .limit(limit)
          .offset(skip),
        db.select({ count: drizzleCount() }).from(accounts),
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
      console.error("[AccountRepository] findMany error:", error);
      return failure(createError("Failed to find accounts", "DB_ERROR", error));
    }
  }

  /**
   * Create a new account
   */
  async create(input: AccountCreateInput): Promise<RepositoryResult<AccountEntity>> {
    try {
      const result = await db.insert(accounts).values({
        ...input,
        id: input.id ?? crypto.randomUUID(), // Assume cuid/uuid replacement
      }).returning();
      return success(result[0]!);
    } catch (error) {
      console.error("[AccountRepository] create error:", error);
      return failure(createError("Failed to create account", "DB_ERROR", error));
    }
  }

  /**
   * Update an existing account
   */
  async update(id: string, input: AccountUpdateInput): Promise<RepositoryResult<AccountEntity>> {
    try {
      const result = await db.update(accounts).set({
        ...input,
        updatedAt: new Date(),
      }).where(eq(accounts.id, id)).returning();

      if (result.length === 0) return failure(createError("Not found", "NOT_FOUND", null));
      return success(result[0]!);
    } catch (error) {
      console.error("[AccountRepository] update error:", error);
      return failure(createError("Failed to update account", "DB_ERROR", error));
    }
  }

  /**
   * Delete an account
   */
  async delete(id: string): Promise<RepositoryResult<AccountEntity>> {
    try {
      const result = await db.delete(accounts).where(eq(accounts.id, id)).returning();
      if (result.length === 0) return failure(createError("Not found", "NOT_FOUND", null));
      return success(result[0]!);
    } catch (error) {
      console.error("[AccountRepository] delete error:", error);
      return failure(createError("Failed to delete account", "DB_ERROR", error));
    }
  }

  /**
   * Delete all accounts for a user
   */
  async deleteByUserId(userId: string): Promise<RepositoryResult<{ count: number }>> {
    try {
      const result = await db.delete(accounts).where(eq(accounts.userId, userId)).returning({ id: accounts.id });
      return success({ count: result.length });
    } catch (error) {
      console.error("[AccountRepository] deleteByUserId error:", error);
      return failure(createError("Failed to delete accounts by user ID", "DB_ERROR", error));
    }
  }

  /**
   * Count total accounts
   */
  async count(): Promise<RepositoryResult<number>> {
    try {
      const result = await db.select({ value: drizzleCount() }).from(accounts);
      return success(result[0]?.value ?? 0);
    } catch (error) {
      console.error("[AccountRepository] count error:", error);
      return failure(createError("Failed to count accounts", "DB_ERROR", error));
    }
  }

  /**
   * Check if account exists for user and provider
   */
  async exists(userId: string, providerId: string): Promise<RepositoryResult<boolean>> {
    try {
      const result = await db.select({ id: accounts.id })
        .from(accounts)
        .where(and(eq(accounts.userId, userId), eq(accounts.providerId, providerId)))
        .limit(1);

      return success(result.length > 0);
    } catch (error) {
      console.error("[AccountRepository] exists error:", error);
      return failure(createError("Failed to check account existence", "DB_ERROR", error));
    }
  }
}

// Export singleton instance
export const accountRepository = new AccountRepository();
