import { db } from "../../db";
import { sessions } from "../../db/schema";
import { eq, count as drizzleCount, sql, lt, gt } from "drizzle-orm";
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

export type SessionEntity = typeof sessions.$inferSelect;
export type SessionCreateInput = typeof sessions.$inferInsert;
export type SessionUpdateInput = Partial<SessionCreateInput>;

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
      const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, id),
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
      return success(session ?? null);
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
      const session = await db.query.sessions.findFirst({
        where: eq(sessions.token, token),
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
      return success(session ?? null);
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

      const [items, totalResult] = await Promise.all([
        db.select()
          .from(sessions)
          .where(eq(sessions.userId, userId))
          .orderBy(sql`${sessions.createdAt} DESC`)
          .limit(limit)
          .offset(skip),
        db.select({ count: drizzleCount() }).from(sessions).where(eq(sessions.userId, userId)),
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

      const [items, totalResult] = await Promise.all([
        db.select()
          .from(sessions)
          .orderBy(sql`${sessions.createdAt} DESC`)
          .limit(limit)
          .offset(skip),
        db.select({ count: drizzleCount() }).from(sessions),
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
      console.error("[SessionRepository] findMany error:", error);
      return failure(createError("Failed to find sessions", "DB_ERROR", error));
    }
  }

  /**
   * Create a new session
   */
  async create(input: SessionCreateInput): Promise<RepositoryResult<SessionEntity>> {
    try {
      const result = await db.insert(sessions).values({
        ...input,
        id: input.id ?? crypto.randomUUID(), // Assume cuid/uuid replacement
      }).returning();
      return success(result[0]!);
    } catch (error) {
      console.error("[SessionRepository] create error:", error);
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === "23505") {
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
      const result = await db.update(sessions).set({
        ...input,
        updatedAt: new Date(),
      }).where(eq(sessions.id, id)).returning();

      if (result.length === 0) return failure(createError("Not found", "NOT_FOUND", null));
      return success(result[0]!);
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
      const result = await db.delete(sessions).where(eq(sessions.id, id)).returning();
      if (result.length === 0) return failure(createError("Not found", "NOT_FOUND", null));
      return success(result[0]!);
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
      const result = await db.delete(sessions).where(eq(sessions.token, token)).returning();
      if (result.length === 0) return failure(createError("Not found", "NOT_FOUND", null));
      return success(result[0]!);
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
      const result = await db.delete(sessions).where(eq(sessions.userId, userId)).returning({ id: sessions.id });
      return success({ count: result.length });
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
      const result = await db.delete(sessions).where(lt(sessions.expiresAt, new Date())).returning({ id: sessions.id });
      return success({ count: result.length });
    } catch (error) {
      console.error("[SessionRepository] deleteExpired error:", error);
      return failure(createError("Failed to delete expired sessions", "DB_ERROR", error));
    }
  }

  /**
   * Count total sessions
   */
  async count(): Promise<RepositoryResult<number>> {
    try {
      const result = await db.select({ value: drizzleCount() }).from(sessions);
      return success(result[0]?.value ?? 0);
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
      const result = await db.select({ id: sessions.id })
        .from(sessions)
        .where(sql`${sessions.token} = ${token} AND ${sessions.expiresAt} > NOW()`)
        .limit(1);

      return success(result.length > 0);
    } catch (error) {
      console.error("[SessionRepository] isValid error:", error);
      return failure(createError("Failed to check session validity", "DB_ERROR", error));
    }
  }
}

// Export singleton instance
export const sessionRepository = new SessionRepository();
