import { prisma } from "../../db";
import type { Prisma } from "../../../generated/prisma/client";
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

export type AccountEntity = {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  accessTokenExpiresAt: Date | null;
  refreshTokenExpiresAt: Date | null;
  scope: string | null;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AccountCreateInput = {
  accountId: string;
  providerId: string;
  userId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  idToken?: string | null;
  accessTokenExpiresAt?: Date | null;
  refreshTokenExpiresAt?: Date | null;
  scope?: string | null;
  password?: string | null;
};

export type AccountUpdateInput = {
  accessToken?: string | null;
  refreshToken?: string | null;
  idToken?: string | null;
  accessTokenExpiresAt?: Date | null;
  refreshTokenExpiresAt?: Date | null;
  scope?: string | null;
  password?: string | null;
};

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
      const account = await prisma.account.findUnique({
        where: { id },
        include: includeUser
          ? {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  role: true,
                },
              },
            }
          : undefined,
      });
      return success(account);
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
      const account = await prisma.account.findFirst({
        where: {
          providerId,
          accountId,
        },
        include: includeUser
          ? {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  role: true,
                },
              },
            }
          : undefined,
      });
      return success(account);
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

      const [items, total] = await Promise.all([
        prisma.account.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.account.count({ where: { userId } }),
      ]);

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

      const [items, total] = await Promise.all([
        prisma.account.findMany({
          where: { providerId },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.account.count({ where: { providerId } }),
      ]);

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

      const [items, total] = await Promise.all([
        prisma.account.findMany({
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.account.count(),
      ]);

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
      const account = await prisma.account.create({
        data: {
          accountId: input.accountId,
          providerId: input.providerId,
          userId: input.userId,
          accessToken: input.accessToken ?? null,
          refreshToken: input.refreshToken ?? null,
          idToken: input.idToken ?? null,
          accessTokenExpiresAt: input.accessTokenExpiresAt ?? null,
          refreshTokenExpiresAt: input.refreshTokenExpiresAt ?? null,
          scope: input.scope ?? null,
          password: input.password ?? null,
        },
      });
      return success(account);
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
      const account = await prisma.account.update({
        where: { id },
        data: input,
      });
      return success(account);
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
      const account = await prisma.account.delete({
        where: { id },
      });
      return success(account);
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
      const result = await prisma.account.deleteMany({
        where: { userId },
      });
      return success({ count: result.count });
    } catch (error) {
      console.error("[AccountRepository] deleteByUserId error:", error);
      return failure(createError("Failed to delete accounts by user ID", "DB_ERROR", error));
    }
  }

  /**
   * Count total accounts
   */
  async count(where?: Prisma.AccountWhereInput): Promise<RepositoryResult<number>> {
    try {
      const count = await prisma.account.count({ where });
      return success(count);
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
      const count = await prisma.account.count({
        where: {
          userId,
          providerId,
        },
      });
      return success(count > 0);
    } catch (error) {
      console.error("[AccountRepository] exists error:", error);
      return failure(createError("Failed to check account existence", "DB_ERROR", error));
    }
  }
}

// Export singleton instance
export const accountRepository = new AccountRepository();
