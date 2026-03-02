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

export type VerificationEntity = {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type VerificationCreateInput = {
  identifier: string;
  value: string;
  expiresAt: Date;
};

export type VerificationUpdateInput = {
  value?: string;
  expiresAt?: Date;
};

// ---------------------
// Repository
// ---------------------

export class VerificationRepository {
  /**
   * Find verification by ID
   */
  async findById(id: string): Promise<RepositoryResult<VerificationEntity | null>> {
    try {
      const verification = await prisma.verification.findUnique({
        where: { id },
      });
      return success(verification);
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
      const verification = await prisma.verification.findFirst({
        where: {
          identifier,
          value,
        },
      });
      return success(verification);
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

      const [items, total] = await Promise.all([
        prisma.verification.findMany({
          where: { identifier },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.verification.count({ where: { identifier } }),
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

      const [items, total] = await Promise.all([
        prisma.verification.findMany({
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.verification.count(),
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
      console.error("[VerificationRepository] findMany error:", error);
      return failure(createError("Failed to find verifications", "DB_ERROR", error));
    }
  }

  /**
   * Create a new verification
   */
  async create(input: VerificationCreateInput): Promise<RepositoryResult<VerificationEntity>> {
    try {
      const verification = await prisma.verification.create({
        data: {
          identifier: input.identifier,
          value: input.value,
          expiresAt: input.expiresAt,
        },
      });
      return success(verification);
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
      const verification = await prisma.verification.update({
        where: { id },
        data: input,
      });
      return success(verification);
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
      const verification = await prisma.verification.delete({
        where: { id },
      });
      return success(verification);
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
      const result = await prisma.verification.deleteMany({
        where: { identifier },
      });
      return success({ count: result.count });
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
      const result = await prisma.verification.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      return success({ count: result.count });
    } catch (error) {
      console.error("[VerificationRepository] deleteExpired error:", error);
      return failure(createError("Failed to delete expired verifications", "DB_ERROR", error));
    }
  }

  /**
   * Count total verifications
   */
  async count(where?: Prisma.VerificationWhereInput): Promise<RepositoryResult<number>> {
    try {
      const count = await prisma.verification.count({ where });
      return success(count);
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
      const count = await prisma.verification.count({
        where: {
          identifier,
          value,
          expiresAt: {
            gt: new Date(),
          },
        },
      });
      return success(count > 0);
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
      const verification = await prisma.verification.findFirst({
        where: {
          identifier,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return success(verification);
    } catch (error) {
      console.error("[VerificationRepository] findLatestValid error:", error);
      return failure(createError("Failed to find latest valid verification", "DB_ERROR", error));
    }
  }
}

// Export singleton instance
export const verificationRepository = new VerificationRepository();
