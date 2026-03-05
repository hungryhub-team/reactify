import { db } from "../../db";
import { verifications } from "../../db/schema";
import { eq, and, count as drizzleCount, sql, lt, gt } from "drizzle-orm";
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

export type VerificationEntity = typeof verifications.$inferSelect;
export type VerificationCreateInput = typeof verifications.$inferInsert;
export type VerificationUpdateInput = Partial<VerificationCreateInput>;

// ---------------------
// Repository
// ---------------------

export class VerificationRepository {
  /**
   * Find verification by ID
   */
  async findById(id: string): Promise<RepositoryResult<VerificationEntity | null>> {
    try {
      const result = await db.select().from(verifications).where(eq(verifications.id, id)).limit(1);
      return success(result[0] ?? null);
    } catch (error) {
      console.error("[VerificationRepository] findById error:", error);
      return failure(createError("Failed to find verification by ID", "DB_ERROR", error));
    }
  }

  /**
   * Find verification by identifier and value
   */
  async findByIdentifierAndValue(
    identifier: string,
    value: string
  ): Promise<RepositoryResult<VerificationEntity | null>> {
    try {
      const result = await db.select()
        .from(verifications)
        .where(and(eq(verifications.identifier, identifier), eq(verifications.value, value)))
        .limit(1);
      return success(result[0] ?? null);
    } catch (error) {
      console.error("[VerificationRepository] findByIdentifierAndValue error:", error);
      return failure(createError("Failed to find verification", "DB_ERROR", error));
    }
  }

  /**
   * Find all verifications by identifier
   */
  async findByIdentifier(identifier: string, params?: PaginationParams): Promise<RepositoryResult<PaginatedData<VerificationEntity>>> {
    try {
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
      const skip = (page - 1) * limit;

      const [items, totalResult] = await Promise.all([
        db.select()
          .from(verifications)
          .where(eq(verifications.identifier, identifier))
          .orderBy(sql`${verifications.createdAt} DESC`)
          .limit(limit)
          .offset(skip),
        db.select({ count: drizzleCount() }).from(verifications).where(eq(verifications.identifier, identifier)),
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
      console.error("[VerificationRepository] findByIdentifier error:", error);
      return failure(createError("Failed to find verifications by identifier", "DB_ERROR", error));
    }
  }

  /**
   * Find all verifications with pagination
   */
  async findMany(params: PaginationParams): Promise<RepositoryResult<PaginatedData<VerificationEntity>>> {
    try {
      const { page, limit } = params;
      const skip = (page - 1) * limit;

      const [items, totalResult] = await Promise.all([
        db.select()
          .from(verifications)
          .orderBy(sql`${verifications.createdAt} DESC`)
          .limit(limit)
          .offset(skip),
        db.select({ count: drizzleCount() }).from(verifications),
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
      console.error("[VerificationRepository] findMany error:", error);
      return failure(createError("Failed to find verifications", "DB_ERROR", error));
    }
  }

  /**
   * Create a new verification
   */
  async create(input: VerificationCreateInput): Promise<RepositoryResult<VerificationEntity>> {
    try {
      const result = await db.insert(verifications).values({
        ...input,
        id: input.id ?? crypto.randomUUID(), // Assume cuid/uuid replacement
      }).returning();
      return success(result[0]!);
    } catch (error) {
      console.error("[VerificationRepository] create error:", error);
      return failure(createError("Failed to create verification", "DB_ERROR", error));
    }
  }

  /**
   * Update an existing verification
   */
  async update(id: string, input: VerificationUpdateInput): Promise<RepositoryResult<VerificationEntity>> {
    try {
      const result = await db.update(verifications).set({
        ...input,
        updatedAt: new Date(),
      }).where(eq(verifications.id, id)).returning();

      if (result.length === 0) return failure(createError("Not found", "NOT_FOUND", null));
      return success(result[0]!);
    } catch (error) {
      console.error("[VerificationRepository] update error:", error);
      return failure(createError("Failed to update verification", "DB_ERROR", error));
    }
  }

  /**
   * Delete a verification
   */
  async delete(id: string): Promise<RepositoryResult<VerificationEntity>> {
    try {
      const result = await db.delete(verifications).where(eq(verifications.id, id)).returning();
      if (result.length === 0) return failure(createError("Not found", "NOT_FOUND", null));
      return success(result[0]!);
    } catch (error) {
      console.error("[VerificationRepository] delete error:", error);
      return failure(createError("Failed to delete verification", "DB_ERROR", error));
    }
  }

  /**
   * Delete verifications by identifier
   */
  async deleteByIdentifier(identifier: string): Promise<RepositoryResult<{ count: number }>> {
    try {
      const result = await db.delete(verifications).where(eq(verifications.identifier, identifier)).returning({ id: verifications.id });
      return success({ count: result.length });
    } catch (error) {
      console.error("[VerificationRepository] deleteByIdentifier error:", error);
      return failure(createError("Failed to delete verifications by identifier", "DB_ERROR", error));
    }
  }

  /**
   * Delete expired verifications
   */
  async deleteExpired(): Promise<RepositoryResult<{ count: number }>> {
    try {
      const result = await db.delete(verifications).where(lt(verifications.expiresAt, new Date())).returning({ id: verifications.id });
      return success({ count: result.length });
    } catch (error) {
      console.error("[VerificationRepository] deleteExpired error:", error);
      return failure(createError("Failed to delete expired verifications", "DB_ERROR", error));
    }
  }

  /**
   * Count total verifications
   */
  async count(): Promise<RepositoryResult<number>> {
    try {
      const result = await db.select({ value: drizzleCount() }).from(verifications);
      return success(result[0]?.value ?? 0);
    } catch (error) {
      console.error("[VerificationRepository] count error:", error);
      return failure(createError("Failed to count verifications", "DB_ERROR", error));
    }
  }

  /**
   * Check if verification exists and is valid (not expired)
   */
  async isValid(identifier: string, value: string): Promise<RepositoryResult<boolean>> {
    try {
      const result = await db.select({ id: verifications.id })
        .from(verifications)
        .where(sql`${verifications.identifier} = ${identifier} AND ${verifications.value} = ${value} AND ${verifications.expiresAt} > NOW()`)
        .limit(1);

      return success(result.length > 0);
    } catch (error) {
      console.error("[VerificationRepository] isValid error:", error);
      return failure(createError("Failed to check verification validity", "DB_ERROR", error));
    }
  }

  /**
   * Find latest valid verification by identifier
   */
  async findLatestValid(identifier: string): Promise<RepositoryResult<VerificationEntity | null>> {
    try {
      const result = await db.select()
        .from(verifications)
        .where(sql`${verifications.identifier} = ${identifier} AND ${verifications.expiresAt} > NOW()`)
        .orderBy(sql`${verifications.createdAt} DESC`)
        .limit(1);

      return success(result[0] ?? null);
    } catch (error) {
      console.error("[VerificationRepository] findLatestValid error:", error);
      return failure(createError("Failed to find latest valid verification", "DB_ERROR", error));
    }
  }
}

// Export singleton instance
export const verificationRepository = new VerificationRepository();
