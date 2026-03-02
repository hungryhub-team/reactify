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

export type SessionEntity = {
  id: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string;
};

export type SessionCreateInput = {
  expiresAt: Date;
  token: string;
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type SessionUpdateInput = {
  expiresAt?: Date;
  token?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type SessionWithUser = SessionEntity & {
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

export class SessionRepository {
  /**
   * Find session by ID
   */
  async findById(id: string, includeUser = false): Promise<RepositoryResult<SessionEntity | SessionWithUser | null>> {
    try {
      const session = await prisma.session.findUnique({
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
      return success(session);
    } catch (error) {
      console.error("[SessionRepository] findById error:", error);
      return failure(createError("Failed to find session by ID", "DB_ERROR", error));
    }
  }

  /**
   * Find session by token
   */
  async findByToken(token: string, includeUser = false): Promise<RepositoryResult<SessionEntity | SessionWithUser | null>> {
    try {
      const session = await prisma.session.findUnique({
        where: { token },
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
      return success(session);
    } catch (error) {
      console.error("[SessionRepository] findByToken error:", error);
      return failure(createError("Failed to find session by token", "DB_ERROR", error));
    }
  }

  /**
   * Find all sessions for a user
   */
  async findByUserId(userId: string, params?: PaginationParams): Promise<RepositoryResult<PaginatedData<SessionEntity>>> {
    try {
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        prisma.session.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.session.count({ where: { userId } }),
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
      console.error("[SessionRepository] findByUserId error:", error);
      return failure(createError("Failed to find sessions by user ID", "DB_ERROR", error));
    }
  }

  /**
   * Find all sessions with pagination
   */
  async findMany(params: PaginationParams): Promise<RepositoryResult<PaginatedData<SessionEntity>>> {
    try {
      const { page, limit } = params;
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        prisma.session.findMany({
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.session.count(),
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
      console.error("[SessionRepository] findMany error:", error);
      return failure(createError("Failed to find sessions", "DB_ERROR", error));
    }
  }

  /**
   * Create a new session
   */
  async create(input: SessionCreateInput): Promise<RepositoryResult<SessionEntity>> {
    try {
      const session = await prisma.session.create({
        data: {
          expiresAt: input.expiresAt,
          token: input.token,
          userId: input.userId,
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
        },
      });
      return success(session);
    } catch (error) {
      console.error("[SessionRepository] create error:", error);
      
      // Handle unique constraint violation
      if (error instanceof Error && "code" in error && error.code === "P2002") {
        return failure(createError("Session token already exists", "DUPLICATE_TOKEN", error));
      }
      
      return failure(createError("Failed to create session", "DB_ERROR", error));
    }
  }

  /**
   * Update an existing session
   */
  async update(id: string, input: SessionUpdateInput): Promise<RepositoryResult<SessionEntity>> {
    try {
      const session = await prisma.session.update({
        where: { id },
        data: input,
      });
      return success(session);
    } catch (error) {
      console.error("[SessionRepository] update error:", error);
      return failure(createError("Failed to update session", "DB_ERROR", error));
    }
  }

  /**
   * Delete a session
   */
  async delete(id: string): Promise<RepositoryResult<SessionEntity>> {
    try {
      const session = await prisma.session.delete({
        where: { id },
      });
      return success(session);
    } catch (error) {
      console.error("[SessionRepository] delete error:", error);
      return failure(createError("Failed to delete session", "DB_ERROR", error));
    }
  }

  /**
   * Delete session by token
   */
  async deleteByToken(token: string): Promise<RepositoryResult<SessionEntity>> {
    try {
      const session = await prisma.session.delete({
        where: { token },
      });
      return success(session);
    } catch (error) {
      console.error("[SessionRepository] deleteByToken error:", error);
      return failure(createError("Failed to delete session by token", "DB_ERROR", error));
    }
  }

  /**
   * Delete all sessions for a user
   */
  async deleteByUserId(userId: string): Promise<RepositoryResult<{ count: number }>> {
    try {
      const result = await prisma.session.deleteMany({
        where: { userId },
      });
      return success({ count: result.count });
    } catch (error) {
      console.error("[SessionRepository] deleteByUserId error:", error);
      return failure(createError("Failed to delete sessions by user ID", "DB_ERROR", error));
    }
  }

  /**
   * Delete expired sessions
   */
  async deleteExpired(): Promise<RepositoryResult<{ count: number }>> {
    try {
      const result = await prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      return success({ count: result.count });
    } catch (error) {
      console.error("[SessionRepository] deleteExpired error:", error);
      return failure(createError("Failed to delete expired sessions", "DB_ERROR", error));
    }
  }

  /**
   * Count total sessions
   */
  async count(where?: Prisma.SessionWhereInput): Promise<RepositoryResult<number>> {
    try {
      const count = await prisma.session.count({ where });
      return success(count);
    } catch (error) {
      console.error("[SessionRepository] count error:", error);
      return failure(createError("Failed to count sessions", "DB_ERROR", error));
    }
  }

  /**
   * Check if session exists and is valid (not expired)
   */
  async isValid(token: string): Promise<RepositoryResult<boolean>> {
    try {
      const count = await prisma.session.count({
        where: {
          token,
          expiresAt: {
            gt: new Date(),
          },
        },
      });
      return success(count > 0);
    } catch (error) {
      console.error("[SessionRepository] isValid error:", error);
      return failure(createError("Failed to check session validity", "DB_ERROR", error));
    }
  }
}

// Export singleton instance
export const sessionRepository = new SessionRepository();
