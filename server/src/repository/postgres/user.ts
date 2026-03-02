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

export type UserEntity = {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean | null;
  image: string | null;
  role: number;
  createdAt: Date;
  updatedAt: Date;
};

export type UserCreateInput = {
  email: string;
  name?: string | null;
  emailVerified?: boolean | null;
  image?: string | null;
  role?: number;
};

export type UserUpdateInput = {
  email?: string;
  name?: string | null;
  emailVerified?: boolean | null;
  image?: string | null;
  role?: number;
};

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
      const user = await prisma.user.findUnique({
        where: { id },
        include: includeRelations
          ? {
              sessions: {
                select: {
                  id: true,
                  token: true,
                  expiresAt: true,
                  createdAt: true,
                },
              },
              accounts: {
                select: {
                  id: true,
                  providerId: true,
                  accountId: true,
                },
              },
            }
          : undefined,
      });
      return success(user);
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
      const user = await prisma.user.findUnique({
        where: { email },
      });
      return success(user);
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

      const where: Prisma.UserWhereInput = {};

      // Apply search filter
      if (q) {
        where.OR = [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ];
      }

      // Apply role filter
      if (role !== undefined && role !== null) {
        where.role = role;
      }

      const [items, total] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.user.count({ where }),
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
      console.error("[UserRepository] findMany error:", error);
      return failure(createError("Failed to find users", "DB_ERROR", error));
    }
  }

  /**
   * Create a new user
   */
  async create(input: UserCreateInput): Promise<RepositoryResult<UserEntity>> {
    try {
      const user = await prisma.user.create({
        data: {
          email: input.email,
          name: input.name ?? null,
          emailVerified: input.emailVerified ?? null,
          image: input.image ?? null,
          role: input.role ?? 2, // Default to USER role
        },
      });
      return success(user);
    } catch (error) {
      console.error("[UserRepository] create error:", error);
      
      // Handle unique constraint violation
      if (error instanceof Error && "code" in error && error.code === "P2002") {
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
      const user = await prisma.user.update({
        where: { id },
        data: input,
      });
      return success(user);
    } catch (error) {
      console.error("[UserRepository] update error:", error);
      
      // Handle unique constraint violation
      if (error instanceof Error && "code" in error && error.code === "P2002") {
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
      const user = await prisma.user.delete({
        where: { id },
      });
      return success(user);
    } catch (error) {
      console.error("[UserRepository] delete error:", error);
      return failure(createError("Failed to delete user", "DB_ERROR", error));
    }
  }

  /**
   * Count total users with optional filter
   */
  async count(where?: Prisma.UserWhereInput): Promise<RepositoryResult<number>> {
    try {
      const count = await prisma.user.count({ where });
      return success(count);
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
      const count = await prisma.user.count({
        where: { id },
      });
      return success(count > 0);
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
      const count = await prisma.user.count({
        where: { email },
      });
      return success(count > 0);
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

      const [items, total] = await Promise.all([
        prisma.user.findMany({
          where: { role },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.user.count({ where: { role } }),
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
      console.error("[UserRepository] findByRole error:", error);
      return failure(createError("Failed to find users by role", "DB_ERROR", error));
    }
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
